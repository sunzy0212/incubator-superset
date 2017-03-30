package data

import (
	"fmt"

	"github.com/qiniu/log.v1"

	"qiniu.com/report/common"
	"qiniu.com/report/rest"
)

type QueryConfig struct {
	DataFormat common.DataFormatType
	Code       common.Code
}

type Executor struct {
	colls          *common.Collections
	client         rest.Client
	dataSetManager *DataSetManager
	// dataSourceManager *DataSourceManager
}

func NewExecutor(colls *common.Collections, restUrls []string) *Executor {
	return &Executor{
		client:         rest.NewDrillClient(restUrls),
		dataSetManager: NewDataSetManager(colls),
	}
}

func (e *Executor) GetDataByDataSource(datasource common.DataSource, tableName string, limit uint64) (ret rest.Results, err error) {
	tableSpec := fmt.Sprintf("%s.%s.%s", datasource.Name, datasource.DbName, tableName)
	sql := fmt.Sprintf("SELECT * FROM %s LIMIT %d", tableSpec, limit)
	log.Debugf("query SQL[%s]", sql)
	ret, err = e.client.Query(sql)
	if err != nil {
		log.Error(err)
		return
	}
	log.Infof("success to get result, length=%d from table %s", len(ret.Rows), tableSpec)
	return
}

func (e *Executor) Execute(cfg QueryConfig) (ret interface{}, err error) {
	log.Debugf("Try get data from code:%#v", cfg.Code)
	sql, err := e.dataSetManager.GenSqlFromCode(cfg)
	if err != nil {
		log.Error(err)
		return
	}
	log.Debugf("Converted SQL[%s]", sql)
	res, err := e.client.Query(sql)
	if err != nil {
		log.Error(err)
		return
	}
	log.Infof("success to get result , length=%d", len(res.Rows))
	for i, v := range res.Rows {
		log.Debugf("%d -> %v", i, v)
	}
	return res.Rows, nil
}
