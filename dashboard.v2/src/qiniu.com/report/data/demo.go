package data

import (
	"qiniu.com/report/common"
	"qiniu.com/report/rest"
)

type Demo struct {
	*common.DataSource
}

func NewDemo(cfg *common.DataSource) *Demo {
	return &Demo{cfg}
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
