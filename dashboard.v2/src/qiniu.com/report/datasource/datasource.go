package datasource

import (
	"fmt"

	"qiniu.com/report/rest"
)

var (
	Err_NOT_IMPLEMENTD = fmt.Errorf("Methods that do not need to be implemented")
)

type Table struct {
	Name string `json:"name"`
}
type RetTables struct {
	Tables []Table `json:"tables"`
}
type Database struct {
	Name string `json:"name"`
}
type RetDatabases struct {
	Databases []Database `json:"databases"`
}

type Field struct {
	Id        string `json:"id"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	Transform string `json:"transform"`
	IsMeasure bool   `json:"isMeasure"`
}

type RetSchema struct {
	Fields []Field `json:"fields"`
}

type DataSourceInterface interface {
	//	TestConn() (bool, error)
	ListDatabases() (RetDatabases, error)
	ListTables() (RetTables, error)
	Schema(tableName string) (RetSchema, error)
	Query(args interface{}) (rest.Results, error)
	GenStorage() rest.Storage
}
