package data

import (
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

func (e *Executor) Execute(cfg QueryConfig) (ret interface{}, err error) {
	log.Debugf("Try get data from code:%#v", cfg.Code)
	sql, err := e.dataSetManager.GenSqlFromCode(cfg.Code)
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
		log.Infof("%s -> %v", i, v)
	}
	//	datas := []map[string]interface{}{
	//		{"name": "Page A", "uv": 4000, "pv": 2400, "amt": 2400},
	//		{"name": "Page B", "uv": 3000, "pv": 1398, "amt": 2210},
	//		{"name": "Page C", "uv": 2000, "pv": 9800, "amt": 2290},
	//		{"name": "Page D", "uv": 2780, "pv": 3908, "amt": 2000},
	//		{"name": "Page E", "uv": 1890, "pv": 4800, "amt": 2181},
	//		{"name": "Page F", "uv": 2390, "pv": 3800, "amt": 2500},
	//		{"name": "Page G", "uv": 3490, "pv": 4300, "amt": 2100},
	//	}
	return res.Rows, nil
}
