package biserver

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"qbox.us/errors"

	"github.com/XeLabs/go-mysqlstack/driver"
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
}

func New(cfg *ApiServerConfig) (*ApiServer, error) {
	server := &ApiServer{}

	log := xlog.NewStdLog(xlog.Level(xlog.DEBUG))
	handler := NewTiDBHandler(log)
	listener, err := driver.NewListener(log, cfg.TcpAddress, handler)
	if err != nil {
		return nil, err
	}
	server.Listener = *listener

	server.MySQLClient, err = sql.Open("mysql", fmt.Sprintf("%s:%s@%s(%s)/%s", cfg.MysqlConfig.User,
		cfg.MysqlConfig.Password,
		cfg.MysqlConfig.Protocol,
		cfg.MysqlConfig.Address,
		cfg.MysqlConfig.MetaDB))
	if err != nil {
		return nil, err
	}

	//checkout mysql is alive
	err = server.MySQLClient.Ping()
	if err != nil {
		fmt.Println("ping mysql server fail", err)
		return nil, err
	}

	//checkout table(users, tables) exists
	result := server.MySQLClient.QueryRow("select * from information_schema.tables where table_schema='report_dev_test' and table_name='users' limit 1")
	err = result.Scan()
	if err != nil && err.Error() == "sql: no rows in result set" {
		_, err = server.MySQLClient.Exec("create table report_dev_test.users (appid TEXT, dbname TEXT)")
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
	} else if err != nil {
		fmt.Println(err)
		return nil, err
	}

	result = server.MySQLClient.QueryRow("select * from information_schema.tables where table_schema='report_dev_test' and table_name='tables' limit 1")
	err = result.Scan()
	if err != nil && err.Error() == "sql: no rows in result set" {
		_, err = server.MySQLClient.Exec("create table report_dev_test.tables (appid TEXT, dbname TEXT, tablename TEXT)")
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

type M map[string]interface{}

type cmdArgs struct {
	CmdArgs []string
}

// POST /v1/dbs/<DBName>
// Content-Type: application/json
// X-Appid: <AppId>
func (s *ApiServer) PostDbs_(args *cmdArgs, env *rpcutil.Env) (err error) {

	appId, dbName, err := getAppidAndDBName(args, env)
	if err != nil {
		return
	}
	//ensure appid is valid

	//create database
	userDBName := constructUserDBName(appId, dbName)
	_, err = s.MySQLClient.Exec(getCreateUserDBSQL(userDBName))
	if err != nil {
		return
	}
	_, err = s.MySQLClient.Exec(fmt.Sprintf("INSERT INTO report_dev_test.users (appid,dbname) VALUES ('%s','%s')", appId, dbName))
	if err != nil {
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

	//ensure appid is valid

	//create database
	selectDBName, err := s.MySQLClient.Prepare(fmt.Sprintf("SELECT dbname from report_dev_test.users where appid= '%s'", appId))
	if err != nil {
		return
	}

	result, err := selectDBName.Query()
	if err != nil {
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
		return
	}
	//ensure appid is valid

	//delete metadata database
	_, err = s.MySQLClient.Exec(fmt.Sprintf("DELETE from report_dev_test.users where appid=%s", appId))
	if err != nil {
		return
	}

	_, err = s.MySQLClient.Exec(fmt.Sprintf("DROP DATABASE %s", constructUserDBName(appId, dbName)))
	if err != nil {
		return
	}

	return
}

// POST /v1/dbs/<DB_Name>/tables
// Content-Type: application/json
// X-Appid: <AppId>
func (s *ApiServer) PostDbs_Tables_(args *cmdArgs, env *rpcutil.Env) (err error) {

	appId, dbName, err := getAppidAndDBName(args, env)
	if err != nil {
		return
	}
	fmt.Println(appId, dbName)
	data, err := ioutil.ReadAll(env.Req.Body)
	if err != nil {
		return
	}

	req := Command{}
	err = json.Unmarshal(data, &req)
	if err != nil {
		return
	}

	//cmd need verify
	_, err = s.MySQLClient.Exec(req.CMD)
	if err != nil {
		return
	}

	_, err = s.MySQLClient.Exec(fmt.Sprintf("INSERT INTO report_dev_test.tables (appid,dbname,tablename) VALUES ('%s','%s','%s')", appId, dbName, args.CmdArgs[1]))
	if err != nil {
		return
	}

	return
}
