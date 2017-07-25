package biserver

import (
	"database/sql"
	"fmt"
	"testing"

	"github.com/XeLabs/go-mysqlstack/sqlparser"
	"github.com/qiniu/mockhttp.v2"
	"qiniu.com/http/httptest.v1"

	_ "github.com/go-sql-driver/mysql"
	"github.com/qiniu/http/restrpc.v1"
)

func Test_NewServer(t *testing.T) {
	cfg := ApiServerConfig{
		TcpAddress: ":8880",
		MysqlConfig: MysqlConfig{
			User:     "root",
			Password: "mypandorapassword2017",
			Protocol: "tcp",
			Address:  "101.71.85.34:3306",
			MetaDB:   "report_dev_test",
		},
	}
	server, err := New(&cfg)
	if err != nil {
		t.Fatal(err)
	}
	if server == nil {
		t.Fatalf("test new server fail,server is expect not to be nil")
	}
}

func Test_apiserver(t *testing.T) {

	clean()
	err := prepare()
	if err != nil {
		t.Fatal(err)
	}
	defer clean()

	cfg := ApiServerConfig{
		TcpAddress: ":8880",
		MysqlConfig: MysqlConfig{
			User:     "root",
			Password: "mypandorapassword2017",
			Protocol: "tcp",
			Address:  "101.71.85.34:3306",
			MetaDB:   "report_dev_test",
		},
	}
	svr, err := New(&cfg)
	if err != nil {
		t.Fatal(err)
	}

	transport := mockhttp.NewTransport()

	router := restrpc.Router{
		Factory:       restrpc.Factory,
		PatternPrefix: "/v1",
		Mux:           restrpc.NewServeMux(),
	}

	transport.ListenAndServe("bi.com", router.Register(svr))
	ctx := httptest.New(t)
	ctx.SetTransport(transport)

	ctx.Exec(`
        # test create db
        post http://bi.com/v1/dbs/dbone
		header X-Appid 123
        ret 200

        get http://bi.com/v1/dbs 
        header X-Appid 123
        ret 200
        json '["dbone"]'

        delete http://bi.com/v1/dbs/dbone
        header X-Appid 123
        ret 200

        get http://bi.com/v1/dbs 
        header X-Appid 123
        ret 200
        json '[]'

        delete http://bi.com/v1/dbs/dbone
        header X-Appid 123
        ret 599

        # test create table
        post http://bi.com/v1/dbs/dbone
		header X-Appid 123
        ret 200

        post http://bi.com/v1/dbs/dbone/tables/tableone
		header X-Appid 123
        ret 200

        get http://bi.com/v1/dbs/dbone/tables
		header X-Appid 123
        ret 200
        json '["tableone"]'

        delete http://bi.com/v1/dbs/dbone/tables/tableone
		header X-Appid 123
        ret 200

        get http://bi.com/v1/dbs/dbone/tables
		header X-Appid 123
        ret 200
        json '[]'
    `)
}

func prepare() error {
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@%s(%s)/%s", "root", "mypandorapassword2017", "tcp", "101.71.85.34:3306", ""))
	if err != nil {
		fmt.Println(err)
		return err
	}
	_, err = db.Exec("create database report_dev_test")
	if err != nil {
		fmt.Println("create database fail")
		return err
	}
	return nil
}

func clean() error {
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@%s(%s)/%s", "root", "mypandorapassword2017", "tcp", "101.71.85.34:3306", "report_dev_test"))
	if err != nil {
		return err
	}
	db.Exec("drop database report_dev_test")
	db.Exec("drop database 123_dbone")

	return nil
}

func Test_Parse(t *testing.T) {

	stmt, err := sqlparser.Parse("create table tableone(a TEXT,b TEXT);")
	if err != nil {
		return
	}
	st, ok := stmt.(*sqlparser.DDL)
	if !ok {
		t.Log("not CREATE")
	}
	st.Database = sqlparser.NewTableIdent("test")
	buf := sqlparser.NewTrackedBuffer(nil)
	st.Format(buf)
	t.Log(string(buf.Bytes()))
}
