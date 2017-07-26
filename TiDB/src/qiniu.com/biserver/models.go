package biserver

import (
	"github.com/XeLabs/go-mysqlstack/sqlparser/depends/sqltypes"
)

type MysqlConfig struct {
	User     string `json:"user"`
	Password string `json:"password"`
	Protocol string `json:"protocol"`
	Address  string `json:"address"`
	MetaDB   string `json:"metadb"`
}

type Command struct {
	CMD string `json:"cmd"`
}

type QueryRet struct {
	Results []Result `json:"results,omitempty"`
}

type Result struct {
	Columns []string           `json:"columns,omitempty"`
	Rows    [][]sqltypes.Value `json:"Rows,omitempty"`
}
