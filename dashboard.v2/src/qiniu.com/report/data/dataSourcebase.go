package data

import (
	"sync"

	"qiniu.com/report/common"
)

type DataSourceManager struct {
	mux     *sync.RWMutex
	sources map[common.DataSource]DataSourceInterface //缓存起连接来，定期清理
}

func NewDataSourceManager() *DataSourceManager {
	return &DataSourceManager{
		mux:     &sync.RWMutex{},
		sources: make(map[common.DataSource]DataSourceInterface),
	}
}

func (m *DataSourceManager) gcDataSource() {
	m.mux.Lock()
	defer m.mux.Unlock()
	//TODO MayBe LRU
}

func genDataSource(ds common.DataSource) DataSourceInterface {
	switch common.ToSourceType(ds.Type) {
	case common.MYSQL:
		return NewMySQL(&ds)
	case common.INFLUXDB:
		return NewInfluxDB(&ds)
	case common.MONGODB:
		return NewMongoDB(&ds)
	default:
		return nil
	}
}

func (m *DataSourceManager) Get(ds common.DataSource) DataSourceInterface {
	m.mux.Lock()
	defer m.mux.Unlock()
	if v, ok := m.sources[ds]; !ok {
		dsi := genDataSource(ds).(DataSourceInterface)
		m.sources[ds] = dsi
		return dsi
	} else {
		return v
	}
	return nil
}
