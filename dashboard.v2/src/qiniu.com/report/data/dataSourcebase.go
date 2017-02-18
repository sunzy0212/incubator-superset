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

}

func genDataSource(ds common.DataSource) DataSourceInterface {
	switch common.ToSourceType(ds.Type) {
	case common.MYSQL:
		return NewMySQL(&ds)
	case common.INFLUXDB:
		return NewInfluxDB(&ds)
	default:
		return nil
	}
}

func (m *DataSourceManager) TestConn(ds common.DataSource) (bool, error) {
	return genDataSource(ds).TestConn()
}

func (m *DataSourceManager) Get(ds common.DataSource) DataSourceInterface {
	if v, ok := m.sources[ds]; !ok {
		dsi := genDataSource(ds).(DataSourceInterface)
		m.sources[ds] = dsi
		return dsi
	} else {
		return v
	}
	return nil
}
