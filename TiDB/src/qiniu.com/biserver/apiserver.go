package biserver

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strings"
	"time"

	"qbox.us/errors"

	"github.com/XeLabs/go-mysqlstack/driver"
	"github.com/XeLabs/go-mysqlstack/sqlparser"

	"github.com/XeLabs/go-mysqlstack/xlog"

	"database/sql"

	_ "github.com/go-sql-driver/mysql"
	"github.com/qiniu/http/rpcutil.v1"
	"github.com/qiniu/log.v1"
	mysqlclient "github.com/rbwsam/ferry/mysql"
)

type ApiServerConfig struct {
	TcpAddress        string
	SampleDatabase    string
	MysqlConfig       MysqlConfig
	SuperMysqlConfig  MysqlConfig
	SupersetSecretKey string
}

type ApiServer struct {
	Listener         driver.Listener
	MySQLClient      *sql.DB
	SuperMySQLClient *sql.DB
	MetaDB           string
	Config           *ApiServerConfig
}

func New(cfg *ApiServerConfig) (*ApiServer, error) {
	server := &ApiServer{}

	if cfg.SampleDatabase == "" {
		log.Warn("sample database configuration is empty")
	}

	if cfg.SupersetSecretKey == "" {
		log.Fatal("superset secrete key is empty, database cannot be created")
	}

	log := xlog.NewStdLog(xlog.Level(xlog.DEBUG))
	handler := NewTiDBHandler(log)
	listener, err := driver.NewListener(log, cfg.TcpAddress, handler)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	server.Listener = *listener
	server.MySQLClient, err = sql.Open("mysql", fmt.Sprintf("%s:%s@%s(%s)/%s", cfg.MysqlConfig.User,
		cfg.MysqlConfig.Password,
		cfg.MysqlConfig.Protocol,
		cfg.MysqlConfig.Address,
		cfg.MysqlConfig.MetaDB))
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	server.SuperMySQLClient, err = sql.Open("mysql", fmt.Sprintf("%s:%s@%s(%s)/%s", cfg.SuperMysqlConfig.User,
		cfg.SuperMysqlConfig.Password,
		cfg.SuperMysqlConfig.Protocol,
		cfg.SuperMysqlConfig.Address,
		cfg.SuperMysqlConfig.MetaDB))
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	server.MetaDB = cfg.MysqlConfig.MetaDB
	server.Config = cfg
	//checkout mysql is alive
	err = server.MySQLClient.Ping()
	if err != nil {
		fmt.Println("ping mysql server fail", err)
		return nil, err
	}

	err = server.SuperMySQLClient.Ping()
	if err != nil {
		fmt.Println("ping superset meta mysql server fail", err)
		return nil, err
	}

	//checkout table(users, tables) exists
	result := server.MySQLClient.QueryRow(fmt.Sprintf("select TABLE_NAME from information_schema.tables where table_schema='%s' and table_name='users' limit 1", cfg.MysqlConfig.MetaDB))
	ret := ""
	err = result.Scan(&ret)
	if err != nil && err.Error() == "sql: no rows in result set" {
		_, err = server.MySQLClient.Exec(fmt.Sprintf("create table %s.users (user TEXT, password TEXT)", cfg.MysqlConfig.MetaDB))
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
	} else if err != nil {
		fmt.Println(err)
		return nil, err
	}

	result = server.MySQLClient.QueryRow(fmt.Sprintf("select TABLE_NAME from information_schema.tables where table_schema='%s' and table_name='dbs' limit 1", cfg.MysqlConfig.MetaDB))
	err = result.Scan(&ret)
	if err != nil && err.Error() == "sql: no rows in result set" {
		_, err = server.MySQLClient.Exec(fmt.Sprintf("create table %s.dbs (appid TEXT, dbname TEXT)", cfg.MysqlConfig.MetaDB))
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
	} else if err != nil {
		return nil, err
	}

	result = server.MySQLClient.QueryRow(fmt.Sprintf("select TABLE_NAME from information_schema.tables where table_schema='%s' and table_name='tables' limit 1", cfg.MysqlConfig.MetaDB))
	err = result.Scan(&ret)
	if err != nil && err.Error() == "sql: no rows in result set" {
		_, err = server.MySQLClient.Exec(fmt.Sprintf("create table %s.tables (appid TEXT, dbname TEXT, tablename TEXT)", cfg.MysqlConfig.MetaDB))
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
	} else if err != nil {
		return nil, err
	}

	return server, nil
}

//处理tcp发过来的查询请求，仅限superset端发送的请求
func (s *ApiServer) Accept() {
	fmt.Println("start to Accept")
	s.Listener.Accept()
	fmt.Println("accept closed")
}

type cmdArgs struct {
	CmdArgs []string
}

type UserInfo struct {
	UserName string `json:"user"`
	Password string `json:"password"`
}

// POST /v1/activate
// X-Appid: <AppId>
func (s *ApiServer) PostActivate(env *rpcutil.Env) (info UserInfo, err error) {

	appId := env.Req.Header.Get(X_APPID)
	if appId == "" {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}

	//check existence of appid
	result, err := s.MySQLClient.Query(fmt.Sprintf("SELECT password from %s.users where user='%s'", s.MetaDB, appId))
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}

	var password string
	for result.Next() {
		err = result.Scan(&password)
		if err != nil {
			err = errors.Info(ErrInternalServerError, err.Error())
			return
		} else {
			break
		}

	}
	//exits, return last password
	if password != "" {
		info.UserName = appId
		info.Password = password
		return
	}

	//not exists, go on
	pwd, err := generatePassword()
	if err != nil {
		err = errors.Info(ErrInternalServerError, "generator password error")
		return
	}

	//create mysql user
	_, err = s.MySQLClient.Exec(fmt.Sprintf("CREATE USER '%s' IDENTIFIED BY '%s'", appId, pwd))
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}

	_, err = s.MySQLClient.Exec(fmt.Sprintf("INSERT INTO %s.users (user,password) VALUES ('%s','%s')", s.MetaDB, appId, pwd))
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}
	info.UserName = appId
	info.Password = pwd

	return
}

// POST /v1/load_examples
// X-Appid: <AppId>
func (s *ApiServer) PostLoadexamples(env *rpcutil.Env) (err error) {
	appId := env.Req.Header.Get(X_APPID)
	if appId == "" {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}

	//ensure appid is valid
	result, err := s.MySQLClient.Query(fmt.Sprintf("SELECT password from %s.users where user='%s'", s.MetaDB, appId))
	if err != nil {
		return
	}

	var password string
	for result.Next() {
		err = result.Scan(&password)
		if err != nil {
			err = errors.Info(ErrInternalServerError, err.Error())
			return
		} else {
			break
		}
	}
	//exits, return last passwords
	if password == "" {
		err = errors.Info(ErrInvalidAppIdError)
		return
	}

	//create database
	userDBName := constructUserDBName(appId, "example_database")
	_, err = s.MySQLClient.Exec(getCreateUserDBSQL(userDBName))
	if err != nil {
		err = translateMysqlError(err)
		return
	}

	log.Info(fmt.Sprintf("GRANT SELECT,DELETE,INSERT,DROP ON %s.* TO '%s' IDENTIFIED BY '%s'", userDBName, appId, password))
	_, err = s.MySQLClient.Exec(fmt.Sprintf("GRANT SELECT,DELETE,INSERT,DROP,CREATE ON %s.* TO '%s' IDENTIFIED BY '%s'", userDBName, appId, password))
	if err != nil {
		return
	}

	//copy sample data to destination database
	items := strings.Split(s.Config.MysqlConfig.Address, ":")
	if len(items) != 2 {
		err = errors.Info(ErrInternalServerError)
		return
	}
	host := items[0]
	port := items[1]
	err = copyTables(&mysqlclient.Config{
		Host:     host,
		Port:     port,
		Database: s.Config.SampleDatabase,
		User:     s.Config.MysqlConfig.User,
		Password: s.Config.MysqlConfig.Password,
	}, &mysqlclient.Config{
		Host:     host,
		Port:     port,
		Database: userDBName,
		User:     s.Config.MysqlConfig.User,
		Password: s.Config.MysqlConfig.Password,
	})

	return
}

// POST /v1/dbs/<DBName>
// Content-Type: application/json
// X-Appid: <AppId>
func (s *ApiServer) PostDbs_(args *cmdArgs, env *rpcutil.Env) (err error) {

	appId, dbName, err := getAppidAndDBName(args, env)
	if err != nil {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}

	//ensure appid is valid
	result, err := s.MySQLClient.Query(fmt.Sprintf("SELECT password from %s.users where user='%s'", s.MetaDB, appId))
	if err != nil {
		return
	}

	var password string
	for result.Next() {
		err = result.Scan(&password)
		if err != nil {
			err = errors.Info(ErrInternalServerError, err.Error())
			return
		} else {
			break
		}
	}
	//exits, return last passwords
	if password == "" {
		err = errors.Info(ErrInvalidAppIdError)
		return
	}

	//create database
	userDBName := constructUserDBName(appId, dbName)
	_, err = s.MySQLClient.Exec(getCreateUserDBSQL(userDBName))
	if err != nil {
		err = translateMysqlError(err)
		return
	}

	log.Info(fmt.Sprintf("GRANT SELECT,DELETE,INSERT,DROP ON %s.* TO '%s' IDENTIFIED BY '%s'", userDBName, appId, password))
	_, err = s.MySQLClient.Exec(fmt.Sprintf("GRANT SELECT,DELETE,INSERT,DROP,CREATE ON %s.* TO '%s' IDENTIFIED BY '%s'", userDBName, appId, password))
	if err != nil {
		log.Error(err)
		return
	}

	//insert metedata into superset
	sqlTemplate := `insert into dbs (
						created_on,
						changed_on,
						database_name,
						sqlalchemy_uri,
						created_by_fk,
						changed_by_fk,
						password,
						select_as_create_table_as,
						allow_ctas,
						expose_in_sqllab,
						allow_run_async,
						allow_run_sync,
						allow_dml,
						qiniu_uid
						) values 
						(
							'%s',
							'%s',
							'%s',
							'%s',
							(select id from ab_user where username='%s'),
							(select id from ab_user where username='%s'),
							'%s',
							0,
							0,
							1,
							0,
							1,
							0,
							%s
						)`
	now := time.Now().Format("2006-01-02 15:04:05")
	uri := fmt.Sprintf("mysql://%s:XXXXXXXXXX@%s/%s", appId, s.Config.MysqlConfig.Address, userDBName)
	pwd, err := getEncryptPasswordForDB(s.Config.SupersetSecretKey, password)
	if err != nil {
		log.Error(err)
		return
	}
	sql := fmt.Sprintf(sqlTemplate, now, now, dbName, uri, appId, appId, pwd, appId)
	//sql += ";\n" + fmt.Sprintf("update dbs set perm=(select concat([]))")
	_, err = s.SuperMySQLClient.Exec(sql)
	if err != nil {
		log.Error(err)
		return
	}
	return
}

// GET /v1/dbs
// Content-Type: application/json
// X-Appid: <AppId>
func (s *ApiServer) GetDbs(env *rpcutil.Env) (dbs []string, err error) {

	appId := env.Req.Header.Get(X_APPID)
	if appId == "" {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}

	//create database
	sql := fmt.Sprintf("SELECT SCHEMA_NAME from information_schema.schemata where SCHEMA_NAME like '%s%%'", appId)
	log.Println(sql)
	result, err := s.MySQLClient.Query(sql)
	if err != nil {
		return
	}

	dbs = make([]string, 0)
	var dbName string
	for result.Next() {
		result.Scan(&dbName)
		if strings.HasPrefix(dbName, appId) {
			dbName = strings.TrimLeft(dbName, appId+"_")
			dbs = append(dbs, dbName)
		}
	}

	return
}

// DELETE /v1/dbs/<DBName>
// Content-Type: application/json
// X-Appid: <AppId>
func (s *ApiServer) DeleteDbs_(args *cmdArgs, env *rpcutil.Env) (dbs []string, err error) {

	appId, dbName, err := getAppidAndDBName(args, env)
	if err != nil {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}

	_, err = s.MySQLClient.Exec(fmt.Sprintf("DROP DATABASE %s", constructUserDBName(appId, dbName)))
	if err != nil {
		err = translateMysqlError(err)
		return
	}

	return
}

// POST /v1/dbs/<DB_Name>/tables/<TableName>
// Content-Type: application/json
// X-Appid: <AppId>
func (s *ApiServer) PostDbs_Tables_(args *cmdArgs, env *rpcutil.Env) (err error) {

	appId, dbName, err := getAppidAndDBName(args, env)
	if err != nil {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}
	data, err := ioutil.ReadAll(env.Req.Body)
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}

	req := Command{}
	err = json.Unmarshal(data, &req)
	if err != nil {
		err = errors.Info(ErrInvalidParameterError)
		return
	}
	stmt, err := sqlparser.Parse(req.CMD)
	if err != nil {
		return
	}
	st, ok := stmt.(*sqlparser.DDL)
	if !ok {
		err = errors.Info(ErrInvalidSqlError)
		return
	}

	st.NewName.Qualifier = sqlparser.NewTableIdent(constructUserDBName(appId, dbName))
	buf := sqlparser.NewTrackedBuffer(nil)
	st.Format(buf)
	rest := req.CMD[strings.Index(req.CMD, "("):]
	req.CMD = buf.ParsedQuery().Query + rest
	log.Info("req.CMD:", req.CMD)

	//cmd need verify
	_, err = s.MySQLClient.Exec(req.CMD)
	if err != nil {
		err = translateMysqlError(err)
		return
	}

	_, err = s.MySQLClient.Exec(fmt.Sprintf("INSERT INTO %s.tables (appid,dbname,tablename) VALUES ('%s','%s','%s')", s.MetaDB, appId, dbName, args.CmdArgs[1]))
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}

	sqlTemplate := `insert into tables (
						created_on,
						changed_on,
						table_name,
						database_id,
						created_by_fk,
						changed_by_fk,
						offset,
						is_featured,
						qiniu_uid
					) values (
						'%s',
						'%s',
						'%s',
						(select id from dbs where database_name='%s'),
						(select id from ab_user where username = '%s'),
						(select id from ab_user where username = '%s'),
						0,
						0,
						%s
					)`

	now := time.Now().Format("2006-01-02 15:04:05")
	sql := fmt.Sprintf(sqlTemplate, now, now, args.CmdArgs[1], dbName, appId, appId, appId)
	_, err = s.SuperMySQLClient.Exec(sql)
	if err != nil {
		log.Error(err)
		return
	}

	return
}

// DELETE /v1/dbs/<DB_Name>/tables/<TableName>
// Content-Type: application/json
// X-Appid: <AppId>
func (s *ApiServer) DeleteDbs_Tables_(args *cmdArgs, env *rpcutil.Env) (err error) {

	appId, dbName, err := getAppidAndDBName(args, env)
	if err != nil {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}

	//cmd need verify
	_, err = s.MySQLClient.Exec(fmt.Sprintf("drop table %s.%s", constructUserDBName(appId, dbName), args.CmdArgs[1]))
	if err != nil {
		err = translateMysqlError(err)
		return
	}

	return
}

// GET /v1/dbs/<DBName>/tables
// Content-Type: application/json
// X-Appid: <AppId>
func (s *ApiServer) GetDbs_Tables(args *cmdArgs, env *rpcutil.Env) (tables []string, err error) {

	tables = make([]string, 0)
	appId, dbName, err := getAppidAndDBName(args, env)
	if err != nil {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}
	//ensure appid is valid

	//create database
	tableNames, err := s.MySQLClient.Prepare(fmt.Sprintf("SELECT TABLE_NAME from information_schema.tables where TABLE_SCHEMA= '%s'", constructUserDBName(appId, dbName)))
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}

	result, err := tableNames.Query()
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}

	var tableName string
	for result.Next() {
		result.Scan(&tableName)
		tables = append(tables, tableName)
	}

	return
}

// GET /v1/dbs/<DBName>/tables/<TableName>
// Content-Type: application/json
// X-Appid: <AppId>
func (s *ApiServer) GetDbs_Tables_(args *cmdArgs, env *rpcutil.Env) (schemas []TableSchema, err error) {

	schemas = make([]TableSchema, 0)
	appId, dbName, err := getAppidAndDBName(args, env)
	if err != nil {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}

	tableName := args.CmdArgs[1]

	userDBName := constructUserDBName(appId, dbName)

	result, err := s.MySQLClient.Query(fmt.Sprintf("describe %s.%s", userDBName, tableName))
	if err != nil {
		if strings.Contains(err.Error(), "Error 1146") {
			err = errors.Info(ErrTableNotFoundError)
			return
		}
		return
	}
	var table_default interface{}
	var table_field string
	var table_key interface{}
	var table_null string
	var table_extra string
	var table_type string

	for result.Next() {
		err = result.Scan(&table_field, &table_type, &table_null, &table_key, &table_default, &table_extra)
		if err != nil {
			return
		}
		schema := TableSchema{
			Field:   table_field,
			Type:    table_type,
			Null:    table_null,
			Extra:   table_extra,
			Default: table_default,
			Key:     table_key,
		}
		schemas = append(schemas, schema)
	}

	return
}

// POST /v1/dbs/<DBName>/tables/<TableName>/data
// Content-Type: application/json
// X-Appid: <AppId>
func (s *ApiServer) PostDbs_Tables_Data(args *cmdArgs, env *rpcutil.Env) (err error) {

	appId, dbName, err := getAppidAndDBName(args, env)
	if err != nil {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}
	tableName := args.CmdArgs[1]

	data, err := ioutil.ReadAll(env.Req.Body)
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}
	schema, values, err := getSchemaAndValues(data)
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}
	conn, err := driver.NewConn("root", "", "10.200.20.39:5000", constructUserDBName(appId, dbName), "")
	if err != nil {
	}
	sql := fmt.Sprintf("INSERT INTO %s.%s (%s) VALUES %s",
		constructUserDBName(appId, dbName),
		tableName,
		schema,
		values,
	)
	err = conn.Exec(sql)
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}

	return
}

// POST /v1/dbs/<DBName>/query
// Content-Type: application/json
// X-Appid: <AppId>
func (s *ApiServer) PostDbs_Query(args *cmdArgs, env *rpcutil.Env) (ret QueryRet, err error) {

	appId, dbName, err := getAppidAndDBName(args, env)
	if err != nil {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}

	data, err := ioutil.ReadAll(env.Req.Body)
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}

	req := Command{}
	err = json.Unmarshal(data, &req)
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}
	if req.CMD == "" {
		err = errors.Info(ErrInvalidSqlError)
		return
	}

	stmt, err := sqlparser.Parse(req.CMD)
	if err != nil {
		err = errors.Info(ErrInvalidSqlError)
		return
	}
	_, ok := stmt.(*sqlparser.Select)
	if !ok {
		err = errors.Info(ErrInvalidSqlError)
		return
	}
	//table must exits in db

	//execute the sql
	conn, err := driver.NewConn("root", "", "10.200.20.39:5000", constructUserDBName(appId, dbName), "")
	if err != nil {
		// err = errors.Info(ErrInternalServerError, err.Error())
		return
	}
	sql := fmt.Sprintf(req.CMD)
	result, err := conn.FetchAll(sql, 10000)
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}

	ret = convertResult(result)
	return
}
