package influxdb

import (
	"testing"

	"qiniu.com/report/common"
)

//curl -i -XPOST http://localhost:8086/query --data-urlencode "q=CREATE DATABASE mydb"
//curl -i -XPOST 'http://localhost:8086/write?db=mydb' --data-binary 'cpu_load_short,host=server01,region=us-west value=0.64 1434055562000000000'

func Test_Query(t *testing.T) {

	cfg := common.DataSource{Host: "http://localhost:8086/query", DbName: "mydb"}
	handler := NewInfluxDB(&cfg)
	ret, err := handler.QueryImpl("table", "SHOW SERIES")
	if err != nil {
		t.Fatal(err)
	}
	t.Log(ret)

	ret, err = handler.QueryImpl("table", "select * from cpu_load_short")
	if err != nil {
		t.Fatal(err)
	}
	t.Log(ret)

	ret2, err := handler.QueryImpl("table", "select sum(value) from cpu_load_short group by host")
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%#v", ret2)

	sql := "select sum(value) as total from cpu_load_short where time> '2016-12-01T00:00:00Z' group by host,region,time(24h)"
	ret3, err := handler.QueryImpl("table", sql)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%v", ret3)

}
