package main

import (
	"testing"
	"time"

	"github.com/qiniu/db/mgoutil.v3"
	"github.com/qiniu/http/jsonrpc.v1"
	"github.com/qiniu/http/restrpc.v1"
	"github.com/qiniu/http/servestk.v1"
	"github.com/qiniu/http/webroute.v1"
	"github.com/qiniu/http/wsrpc.v1"
	"github.com/qiniu/mockhttp.v2"

	"qiniu.com/http/httptest.v1"
	. "qiniu.com/report/common"
)

func Test_ApiServer(t *testing.T) {

	var colls Collections
	mcfg := mgoutil.Config{Host: "127.0.0.1:27017", DB: "report"}
	session, err := mgoutil.Open(&colls, &mcfg)
	if err != nil {
		t.Fatalf("Open MongoDB failed: %v", err)
	}

	go func() {
		session.SetSocketTimeout(time.Second * 5)
		session.SetSyncTimeout(time.Second * 5)
		for {
			err := session.Ping()
			if err != nil {
				session.Refresh()
				session.SetSocketTimeout(time.Second * 5)
				session.SetSyncTimeout(time.Second * 5)
			} else {
				time.Sleep(time.Second * 5)
			}
		}
	}()

	svr, err := NewService(colls)
	if err != nil {
		defer session.Close()
		t.Fatalf("New service failed: %v", err)
	}

	transport := mockhttp.NewTransport()

	router := restrpc.Router{
		Factory:       restrpc.Factory,
		PatternPrefix: "/v1",
		Mux:           restrpc.NewServeMux(),
	}

	wsRouter := webroute.Router{
		Factory:       wsrpc.Factory.Union(jsonrpc.Factory),
		PatternPrefix: "/v1",
		Mux:           servestk.New(nil),
	}

	router.Default = wsRouter.Register(svr)
	transport.ListenAndServe("report.qiniuapi.com", router.Register(svr))
	ctx := httptest.New(t)
	ctx.SetTransport(transport)
	svr.DatasetColl.RemoveAll(M{})
	svr.CodeColl.RemoveAll(M{})
	svr.ReportColl.RemoveAll(M{})
	svr.ChartColl.RemoveAll(M{})
	svr.LayoutColl.RemoveAll(M{})
	ctx.Exec(`
		
		### Dataset create
		post http://report.qiniuapi.com/v1/datasets
		header Content-Type application/json		
		json '{
			"host":"127.0.0.1",
			"port":3306,
		    "type": "MYSQL",
		    "dbName": "dbname",
		    "username": "",
		    "password": ""
		}'		
		ret 200
		json '{
			"id": $(id1),
			"host":"127.0.0.1",
			"port":3306,
			"type": "MYSQL",
		    "dbName": "dbname",
		    "username": "",
		    "password": "",
			"createTime" : $(ct1)
		}'
		
		### Dataset list
		get http://report.qiniuapi.com/v1/datasets
		ret 200
		json '{
			"datasets" : [
	    	{	
				"id" : $(id1),
	    		"type" : "MYSQL",
				"host":"127.0.0.1",
				"port":3306,
	   			"dbName" : "dbname",
	    		"username" : "",
	    		"password" : "",
				"createTime" : $(ct1)
			}]
		}'
		### Dataset put
		put http://report.qiniuapi.com/v1/datasets/$(id1)
		json '{
			"host":"127.0.0.1",
			"port":3306,
			"type" : "MYSQL",
   			"dbName" : "test",
    		"username" : "",
    		"password" : ""
		}'
		ret 200

		### Dataset delete 
		delete http://report.qiniuapi.com/v1/datasets/12
		ret 404
		json '{
			"error":"E4201: 12 is not exist"
		}'	
		
		### Dataset delete 
		### delete http://report.qiniuapi.com/v1/datasets/$(id1)
		### ret 200	
		
		
		########################### codes api
		### Codes create
		post http://report.qiniuapi.com/v1/codes
		header Content-Type application/json		
		json '{
			"name": "mysql_sql",
		    "type": "MYSQL",
		    "datasetId": $(id1),
		    "code": "select * from xx"
		}'	
		ret 200
		json '{
			"id": $(cid1),
			"name": "mysql_sql",
		    "type": "MYSQL",
		    "datasetId": $(id1),
		    "code": "select * from xx",
			"createTime" : $(cct1)
		}'
		### Code list
		get http://report.qiniuapi.com/v1/codes
		ret 200
		json '{
			"codes" : [
	    	{	
				"id" : $(cid1),
	    		"type" : "MYSQL",
	   			"name": "mysql_sql",
	    		"datasetId": $(id1),
	    		"code": "select * from xx",
				"createTime" : $(ct1)
			}]
		}'
		
		### Codes put
		put http://report.qiniuapi.com/v1/codes/$(cid1)
		json '{
			"name": "mysql_sql",
		    "type": "MYSQL",
		    "datasetId": $(id1),
		    "code": "select * from xx where id=yyy"
		}'
		ret 200

		### Codes delete 
		delete http://report.qiniuapi.com/v1/codes/122
		ret 404
		json '{
			"error":"E4201: 122 is not exist"
		}'
		
		### Codes delete 
		### delete http://report.qiniuapi.com/v1/codes/$(cid1)
		### ret 200	
		
		########################### reports api
		### Reports create
		post http://report.qiniuapi.com/v1/reports
		header Content-Type application/json		
		json '{
			"name": "report1"
		}'	
		ret 200
		json '{
			"id": $(rid1),
			"name": "report1",
			"createTime" : $(rct1)
		}'
		
		### Reports List
		get http://report.qiniuapi.com/v1/reports
		header Content-Type application/json			
		ret 200
		json '{
			"reports": [{
				"id": $(rid1),
				"name": "report1",
				"createTime" : $(rct1)
			}]
		}'	
			
		### Reports delete 
		delete http://report.qiniuapi.com/v1/reports/1223
		ret 404
		json '{
			"error":"E4201: 1223 is not exist"
		}'
		### Reports delete 
		### delete http://report.qiniuapi.com/v1/reports/$(rid1)
		### ret 200
		
		########################### charts api
		### Charts create
		post http://report.qiniuapi.com/v1/reports/$(rid1)/charts/1
		header Content-Type application/json		
		json '{
			"title" : "chart1",
    		"subTitle" : "我是子标题",
    		"type" : "pie",
    		"stack" : false,
    		"codeId" : $(cid1)
		}'	
		ret 200
		
		post http://report.qiniuapi.com/v1/reports/not_exist_reportId/charts/1
		header Content-Type application/json		
		json '{
			"title" : "chart1",
    		"subTitle" : "我是子标题",
    		"type" : "pie",
    		"stack" : false,
    		"codeId" : $(cid1)
		}'	
		ret 404
		json '{
			"error":"E4201: report not_exist_reportId not exist"
		}'
		
		post http://report.qiniuapi.com/v1/reports/$(rid1)/charts/1
		header Content-Type application/json		
		json '{
			"title" : "chart1",
    		"subTitle" : "我是子标题",
    		"type" : "pie",
    		"stack" : false,
    		"codeId" : "wrong_code_id"
		}'	
		ret 404
		json '{
			"error":"E4201: code wrong_code_id not exist"
		}'
		
		### Charts list
		get http://report.qiniuapi.com/v1/reports/$(rid1)/charts
		ret 200
		json '{
			"charts" : [
	    	{	
				"id" : $(ccid1),
	    		"title" : "chart1",
    			"subTitle" : "我是子标题",
    			"type" : "pie",
    			"stack" : false,
    			"codeId" : $(cid1),
				"reportId" : $(rid1)
			}]
		}'
		
		### Charts get
		get http://report.qiniuapi.com/v1/reports/$(rid1)/charts/1
		ret 200
		json '{
	    		"title" : "chart1",
    			"subTitle" : "我是子标题",
    			"type" : "pie",
    			"stack" : false,
    			"codeId" : $(cid1),
				"code": "select * from xx where id=yyy"
		}'
		
		### Charts delete 
		delete http://report.qiniuapi.com/v1/reports/1223/charts/$(ccid1)
		ret 404
		json '{
			"error":"E4201: report 1223 not exist"
		}'
		### Reports delete 
		### delete http://report.qiniuapi.com/v1/reports/$(rid1)/charts/$(ccid1)
		### ret 200
		
		########################### layouts api
		### Layouts create
		post http://report.qiniuapi.com/v1/layouts/$(rid1)
		header Content-Type application/json		
		json '{
			"reportId" : $(rid1),
    		"layouts" : [
        	{
            	"chartId" : $(ccid1),
            	"data" : {
					"x" : 0,
					"y" : 0,
					"w" : 10,
					"h" : 20
				}
        	}
    		]
		}'	
		ret 200
		
		### Layouts get
		get http://report.qiniuapi.com/v1/layouts/$(rid1)
		ret 200 
		json '{
			"reportId" : $(rid1),
    		"layouts" : [
        	{
            	"chartId" : $(ccid1),
            	"data" : {
					"x" : 0,
					"y" : 0,
					"w" : 10,
					"h" : 20
				}
        	}
    		]
		}'
		
		########################### Query api
		###### Query api   格式为table的查询 
		### 先创建sql
		post http://report.qiniuapi.com/v1/codes
		header Content-Type application/json		
		json '{
			"name": "mysql_sql",
		    "type": "MYSQL",
		    "datasetId": $(id1),
		    "code": "select * from sales"
		}'	
		ret 200
		json '{
			"id": $(codeId_1),
			"name": "mysql_sql",
		    "type": "MYSQL",
		    "datasetId": $(id1),
		    "code": "select * from sales",
			"createTime" : $(cct_1)
		}'
		
		### 查询
		get http://report.qiniuapi.com/v1/datas?q=$(codeId_1)
		ret 200
		json '{
			"Tags":["id","name","sum"],
			"Datas":[
				["1","wcx","99"],
				["1","zhp","100"],
				["2","wph","101"]
			]
		}'
		
		###### Query api   格式为line/bar/pie等图表类 查询 
		### 先创建sql
		
		post http://report.qiniuapi.com/v1/codes
		header Content-Type application/json		
		json '{
			"name": "mysql_sql",
		    "type": "MYSQL",
		    "datasetId": $(id1),
		    "code": "select sum(sum) as 销售额 , id, name as 姓名 from sales group by  name,id;"
		}'	
		ret 200
		json '{
			"id": $(codeId_2),
			"name": "mysql_sql",
		    "type": "MYSQL",
		    "datasetId": $(id1),
		    "code": "select sum(sum) as 销售额 , id, name as 姓名 from sales group by  name,id;",
			"createTime" : $(cct_2)
		}'
		
		### Query api   格式为table的查询 
		get http://report.qiniuapi.com/v1/datas?q=$(codeId_2)&type=line
		ret 200
		json '{
			"Tags":["销售额"],
			"Times":["1-wcx","2-wph","1-zhp"],
			"Datas":[[99,101,100]]
		}'
		
	`)

}
