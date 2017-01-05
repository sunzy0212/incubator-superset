package data

import (
	"testing"
)

func Test_ParseCols(t *testing.T) {
	sql := "select icp as '运营商',sum(flow)/1024/1024/1024 as '流量(G)' from icp2 group by icp order by sum(flow);"
	colls := parseCols(sql)
	if len(colls) != 2 || colls["icp"] != "运营商" {
		t.Error(colls)
	}
	group_ff := parseGroupCols(sql)
	if len(group_ff) != 1 || group_ff[0] != "icp" {
		t.Error(group_ff)
	}
}

//func Test_Mysql(t *testing.T) {
//	/*
//		use test;
//		create table sales (id int, name varchar(12), sum int);
//		insert into  sales values(1,"wcx",99);
//		insert into  sales values(1,"zhp",100);
//		insert into  sales values(2,"wph",101);
//	*/
//	config := MySQLConfig{
//		Host:     "127.0.0.1",
//		Port:     3306,
//		Db:       "test",
//		Username: "",
//		Password: "",
//	}
//	db := NewMySQL(&config)
//	code := "select * from sales"

//	rs, err := db.QueryImpl("", code)
//	ttd := TagData{
//		Type: "TABLE",
//		Tags: []string{"id", "name", "sum"},
//		Datas: [][]interface{}[]interface{}{"1", "wcx", "99"},
//			[]interface{}{"1", "zhp", "100"},
//			[]interface{}{"2", "wph", "101"},
//		},
//	}
//	if err != nil || !reflect.DeepEqual(rs, ttd) {
//		t.Fatal(fmt.Printf("%v\n%v", rs, ttd))
//	}

//	ttd2 := TagTimeData{
//		Type:  "LINE",
//		Tags:  []string{"sum"},
//		Times: []string{"1-wcx", "1-zhp", "2-wph"},
//		Datas: [][]float64{[]float64{99, 100, 101}},
//	}

//	rs2, err := db.QueryImpl("LINE", code)
//	if err != nil || !reflect.DeepEqual(rs2, ttd2) {
//		t.Fatal(fmt.Printf("%v\n%v", rs2, ttd2))
//	}

//	code = "select sum(sum) as '销售额' , id, name as '姓名' from sales group by  name,id;"
//	rs3, err := db.QueryImpl("LINE", code)

//	ttd3 := TagTimeData{
//		Type:  "LINE",
//		Tags:  []string{"销售额"},
//		Times: []string{"1-wcx", "2-wph", "1-zhp"},
//		Datas: [][]float64{[]float64{99, 101, 100}},
//	}

//	if err != nil || !reflect.DeepEqual(rs3, ttd3) {
//		t.Fatal(fmt.Printf("%#v\n%#v", rs3, ttd3))
//	}
//}
