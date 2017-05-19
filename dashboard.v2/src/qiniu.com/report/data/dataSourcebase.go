package data

import (
	"fmt"
	"sync"

	"qiniu.com/report/common"
	"qiniu.com/report/datasource"
	"qiniu.com/report/datasource/demo"
	"qiniu.com/report/datasource/influxdb"
	"qiniu.com/report/datasource/mongodb"
	"qiniu.com/report/datasource/mysql"
	"qiniu.com/report/datasource/tsdb"
)

type DataSourceManager struct {
	mux     *sync.RWMutex
	sources map[common.DataSource]datasource.DataSourceInterface //缓存起连接来，定期清理
}

func NewDataSourceManager() *DataSourceManager {
	return &DataSourceManager{
		mux:     &sync.RWMutex{},
		sources: make(map[common.DataSource]datasource.DataSourceInterface),
	}
}

func (m *DataSourceManager) gcDataSource() {
	m.mux.Lock()
	defer m.mux.Unlock()
	//TODO MayBe LRU
}

func genDataSource(ds common.DataSource) (datasource.DataSourceInterface, error) {
	switch common.ToSourceType(ds.Type) {
	case common.DEMO:
		return demo.NewDemo(&ds)
	case common.MYSQL:
		return mysql.NewMySQL(&ds)
	case common.INFLUXDB:
		return influxdb.NewInfluxDB(&ds)
	case common.MONGODB:
		return mongodb.NewMongoDB(&ds)
	case common.TSDB:
		return tsdb.NewTSDB(&ds)
	default:
		return nil, fmt.Errorf("type %s not support yet", ds.Type)
	}
}

func (m *DataSourceManager) Get(ds common.DataSource, cached bool) (datasource.DataSourceInterface, error) {
	m.mux.Lock()
	defer m.mux.Unlock()
	if v, ok := m.sources[ds]; !ok {
		dsi, err := genDataSource(ds)
		if err != nil {
			return nil, err
		}
		if cached {
			m.sources[ds] = dsi
		}
		return dsi, nil
	} else {
		return v, nil
	}

}
