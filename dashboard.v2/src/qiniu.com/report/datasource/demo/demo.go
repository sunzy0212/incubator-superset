package demo

import (
	"fmt"

	"qiniu.com/report/common"
	. "qiniu.com/report/datasource"
	"qiniu.com/report/rest"
)

type Demo struct {
	*common.DataSource
}

func NewDemo(cfg *common.DataSource) (*Demo, error) {
	return &Demo{cfg}, nil
}

func (m *Demo) ListDatabases() (RetDatabases, error) {
	return RetDatabases{}, nil
}

func (m *Demo) ListTables() (RetTables, error) {
	return RetTables{}, nil
}

func (m *Demo) Schema(table string) (RetSchema, error) {
	return RetSchema{}, nil
}

func (m *Demo) GenStorage() rest.Storage {
	return rest.Storage{
		Name: "cp",
		Config: rest.StorageConfig{
			Type:    "file",
			Enabled: true,
		},
	}
}

func (m *Demo) Query(args interface{}) (rest.Results, error) {
	return rest.Results{}, fmt.Errorf("This type [%s] does not need to be supported temporary", m.Type)
}
