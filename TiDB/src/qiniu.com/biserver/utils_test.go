package biserver

import (
	"encoding/json"
	"testing"

	"github.com/XeLabs/go-mysqlstack/sqlparser/depends/sqltypes"
)

func Test_getSchemaAndValues(t *testing.T) {
	data := []byte("id,name,age\n01,test,123\n02,test2,456")
	schema, values, err := getSchemaAndValues(data)
	if err != nil {
		t.Fatal(err)
	}
	t.Log(schema, values)
}

func Test_convertResult(t *testing.T) {
	resultStr := `{"fields":[{"name":"id","type":6163,"table":"tableone","org_table":"tableone","database":"123_dbone","org_name":"id","column_length":196605,"charset":33,"flags":16},{"name":"name","type":6163,"table":"tableone","org_table":"tableone","database":"123_dbone","org_name":"name","column_length":196605,"charset":33,"flags":16},{"name":"age","type":263,"table":"tableone","org_table":"tableone","database":"123_dbone","org_name":"age","column_length":11,"charset":63}],"rows_affected":2,"insert_id":0,"rows":[["id1","name1",18],["id2","name2",28]],"extras":null}`
	result := sqltypes.Result{}
	err := json.Unmarshal([]byte(resultStr), &result)
	if err != nil {
		t.Fatal(err)
	}
	t.Log(result)
	ret := convertResult(&result)
	t.Log(ret)
}
