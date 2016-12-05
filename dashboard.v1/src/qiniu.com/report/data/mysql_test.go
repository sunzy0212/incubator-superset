package data

import (
	"fmt"
	"reflect"
	"testing"
)

func Test_Mysql(t *testing.T) {
	/*
		use test;
		create table sales (id int, name varchar(12), sum int);
		insert into  sales values(1,"wcx",99);
		insert into  sales values(1,"zhp",100);
		insert into  sales values(2,"wph",101);
	*/
	db := Mysql{
		Host:     "127.0.0.1",
		Port:     3306,
		Db:       "test",
		Username: "",
		Password: "",
	}
	code := "select * from sales"

	rs, err := db.Query("", code)
	ttd := TagData{
		Type: "TABLE",
		Tags: []string{"id", "name", "sum"},
		Datas: [][]string{[]string{"1", "wcx", "99"},
			[]string{"1", "zhp", "100"},
			[]string{"2", "wph", "101"},
		},
	}
	if err != nil || !reflect.DeepEqual(rs, ttd) {
		t.Fatal(fmt.Printf("%v\n%v", rs, ttd))
	}

	ttd2 := TagTimeData{
		Type:  "LINE",
		Tags:  []string{"sum"},
		Times: []string{"1-wcx", "1-zhp", "2-wph"},
		Datas: [][]float64{[]float64{99, 100, 101}},
	}

	rs2, err := db.Query("LINE", code)
	if err != nil || !reflect.DeepEqual(rs2, ttd2) {
		t.Fatal(fmt.Printf("%v\n%v", rs2, ttd2))
	}

	code = "select sum(sum) as '销售额' , id, name as '姓名' from sales group by  name,id;"
	rs3, err := db.Query("LINE", code)

	ttd3 := TagTimeData{
		Type:  "LINE",
		Tags:  []string{"销售额"},
		Times: []string{"1-wcx", "2-wph", "1-zhp"},
		Datas: [][]float64{[]float64{99, 101, 100}},
	}

	if err != nil || !reflect.DeepEqual(rs3, ttd3) {
		t.Fatal(fmt.Printf("%#v\n%#v", rs3, ttd3))
	}
}
