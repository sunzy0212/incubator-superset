package biserver

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strings"

	"qbox.us/errors"

	"github.com/XeLabs/go-mysqlstack/driver"
	"github.com/XeLabs/go-mysqlstack/sqlparser"

	"github.com/XeLabs/go-mysqlstack/xlog"

	"database/sql"

	_ "github.com/go-sql-driver/mysql"

	"github.com/qiniu/http/rpcutil.v1"
)

type ApiServerConfig struct {
	TcpAddress  string
	MysqlConfig MysqlConfig
}

type ApiServer struct {
	Listener    driver.Listener
	MySQLClient *sql.DB
	MetaDB      string
}

func New(cfg *ApiServerConfig) (*ApiServer, error) {
	server := &ApiServer{}

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
	server.MetaDB = cfg.MysqlConfig.MetaDB

	//checkout mysql is alive
	err = server.MySQLClient.Ping()
	if err != nil {
		fmt.Println("ping mysql server fail", err)
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
	userInfo, err := s.MySQLClient.Prepare(fmt.Sprintf("SELECT password from %s.users where user='%s'", s.MetaDB, appId))
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
		return
	}

	result, err := userInfo.Query()
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}

	password := make([]string, 0)
	var dbName string
	for result.Next() {
		result.Scan(&dbName)
		password = append(password, dbName)
	}
	//exits, return last password
	if len(password) > 0 {
		info.UserName = appId
		info.Password = password[0]
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
	userInfo, err := s.MySQLClient.Prepare(fmt.Sprintf("SELECT password from %s.users where user='%s'", s.MetaDB, appId))
	if err != nil {
		err = errors.Info(ErrInvalidSqlError, "prepare select error")
		return
	}

	result, err := userInfo.Query()
	if err != nil {
		err = errors.Info(ErrInternalServerError, "userinfo query error")
		return
	}

	appids := make([]string, 0)
	var appid string
	for result.Next() {
		result.Scan(&appid)
		appids = append(appids, appid)
	}
	//exits, return last appids
	if len(appids) < 1 {
		err = errors.Info(ErrInvalidAppIdError)
		return
	}

	//create database
	userDBName := constructUserDBName(appId, dbName)
	_, err = s.MySQLClient.Exec(getCreateUserDBSQL(userDBName))
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
	}

	_, err = s.MySQLClient.Exec(fmt.Sprintf("INSERT INTO %s.dbs (appid,dbname) VALUES ('%s','%s')", s.MetaDB, appId, dbName))
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
	}
	fmt.Println(fmt.Sprintf("GRANT SELECT,DELETE,INSERT,DROP ON %s.* TO '%s' IDENTIFIED BY '%s'", userDBName, appId, appids[0]))
	_, err = s.MySQLClient.Exec(fmt.Sprintf("GRANT SELECT,DELETE,INSERT,DROP,CREATE ON %s.* TO '%s' IDENTIFIED BY '%s'", userDBName, appId, appids[0]))
	if err != nil {
		err = errors.Info(ErrInternalServerError, err.Error())
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
	selectDBName, err := s.MySQLClient.Prepare(fmt.Sprintf("SELECT dbname from %s.dbs where appid= '%s'", s.MetaDB, appId))
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}

	result, err := selectDBName.Query()
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}

	dbs = make([]string, 0)
	var dbName string
	for result.Next() {
		result.Scan(&dbName)
		dbs = append(dbs, dbName)
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
	//ensure appid is valid

	//delete metadata database
	_, err = s.MySQLClient.Exec(fmt.Sprintf("DELETE from %s.dbs where appid=%s", s.MetaDB, appId))
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}

	_, err = s.MySQLClient.Exec(fmt.Sprintf("DROP DATABASE %s", constructUserDBName(appId, dbName)))
	if err != nil {
		err = errors.Info(ErrInternalServerError)
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
	fmt.Println(appId, dbName)
	data, err := ioutil.ReadAll(env.Req.Body)
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}

	req := Command{}
	err = json.Unmarshal(data, &req)
	if err != nil {
		err = errors.Info(ErrInvalidParameterError)
		return
	}

	fmt.Println(">>>>", req.CMD)

	stmt, err := sqlparser.Parse(req.CMD)
	if err != nil {
		err = errors.Info(ErrInternalServerError)
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
	fmt.Println(">>>>", req.CMD)

	//cmd need verify
	_, err = s.MySQLClient.Exec(req.CMD)
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}

	_, err = s.MySQLClient.Exec(fmt.Sprintf("INSERT INTO %s.tables (appid,dbname,tablename) VALUES ('%s','%s','%s')", s.MetaDB, appId, dbName, args.CmdArgs[1]))
	if err != nil {
		err = errors.Info(ErrInternalServerError)
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
	fmt.Println(appId, dbName)

	//cmd need verify
	_, err = s.MySQLClient.Exec(fmt.Sprintf("drop table %s.%s", constructUserDBName(appId, dbName), args.CmdArgs[1]))
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}

	_, err = s.MySQLClient.Exec(fmt.Sprintf("DELETE FROM %s.tables WHERE appid='%s' and dbname='%s' and tablename='%s'", s.MetaDB, appId, dbName, args.CmdArgs[1]))
	if err != nil {
		err = errors.Info(ErrInternalServerError)
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
	tableNames, err := s.MySQLClient.Prepare(fmt.Sprintf("SELECT tablename from %s.tables where appid= '%s' and dbname='%s'", s.MetaDB, appId, dbName))
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}

	result, err := tableNames.Query()
	if err != nil {
		err = errors.Info(ErrInternalServerError)
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
func (s *ApiServer) GetDbs_Tables_(args *cmdArgs, env *rpcutil.Env) (tables []string, err error) {

	tables = make([]string, 0)
	appId, dbName, err := getAppidAndDBName(args, env)
	if err != nil {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}
	//ensure appid is valid

	//create database
	tableNames, err := s.MySQLClient.Prepare(fmt.Sprintf("SELECT tablename from %s.tables where appid= '%s' and dbname='%s'", s.MetaDB, appId, dbName))
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}

	result, err := tableNames.Query()
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}

	var tableName string
	for result.Next() {
		result.Scan(&tableName)
		tables = append(tables, tableName)
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
		err = errors.Info(ErrInternalServerError)
		return
	}
	schema, values, err := getSchemaAndValues(data)
	if err != nil {
		err = errors.Info(ErrInternalServerError)
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
		err = errors.Info(ErrInternalServerError)
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

	fmt.Println(appId, dbName)
	data, err := ioutil.ReadAll(env.Req.Body)
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}

	req := Command{}
	err = json.Unmarshal(data, &req)
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}
	if req.CMD == "" {
		err = errors.Info(ErrInvalidSqlError)
		return
	}

	fmt.Println(">>>>>>>>>>>>>", req.CMD)

	//appid must own this db
	dbs, err := getDBByAppID(s.MySQLClient, s.MetaDB, appId)
	if err != nil {
		return
	}

	found := false
	for _, db := range dbs {
		if db == dbName {
			found = true
		}
	}
	if !found {
		err = errors.Info(ErrDBNotFoundError)
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
		err = errors.Info(ErrInternalServerError)
		return
	}
	sql := fmt.Sprintf(req.CMD)
	result, err := conn.FetchAll(sql, 10000)
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}
	bs, err := json.Marshal(result)
	if err != nil {
		err = errors.Info(ErrInternalServerError)
		return
	}
	fmt.Println(string(bs))

	ret = convertResult(result)
	return
}
