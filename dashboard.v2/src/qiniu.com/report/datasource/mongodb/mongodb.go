package mongodb

import (
	"fmt"

	"qiniu.com/report/common"
	. "qiniu.com/report/datasource"
	"qiniu.com/report/rest"
)

type MongoDB struct {
	*common.DataSource
}

func NewMongoDB(cfg *common.DataSource) (*MongoDB, error) {
	return &MongoDB{cfg}, nil
}

func (m *MongoDB) ListDatabases() (RetDatabases, error) {
	return RetDatabases{}, nil
}

func (m *MongoDB) ListTables() (RetTables, error) {
	return RetTables{}, nil
}

func (m *MongoDB) Schema(table string) (RetSchema, error) {
	return RetSchema{}, nil
}

func (m *MongoDB) GenStorage() rest.Storage {
	return rest.Storage{
		Name: fmt.Sprintf("%s_%s", m.AppUri, m.Name),
		Config: rest.StorageConfig{
			Type:       "mongo",
			Enabled:    true,
			Connection: fmt.Sprintf("mongodb://%s:%d", m.Host, m.Port),
		},
	}
}

func (m *MongoDB) Query(sql string) (rest.Results, error) {
	return rest.Results{}, fmt.Errorf("This type [%s] does not need to be supported temporary", m.Type)
}
