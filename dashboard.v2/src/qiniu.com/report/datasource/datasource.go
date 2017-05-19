package datasource

import (
	"qiniu.com/report/rest"
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
	Query(sql string) (rest.Results, error)
	GenStorage() rest.Storage
}
