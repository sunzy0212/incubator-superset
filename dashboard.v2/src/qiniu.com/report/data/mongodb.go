package data

import (
	"fmt"

	"qiniu.com/report/common"
	"qiniu.com/report/rest"
)

type MongoDB struct {
	*common.DataSource
}

func NewMongoDB(cfg *common.DataSource) *MongoDB {
	return &MongoDB{cfg}
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
