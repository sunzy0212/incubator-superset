package data

import (
	"sync"

	"qiniu.com/report/common"
)

type DataSetManager struct {
	mux  *sync.RWMutex
	sets map[string]DataSetInterface //缓存起连接来，定期清理
}

func NewDataSetManager() *DataSetManager {
	return &DataSetManager{
		mux:  &sync.RWMutex{},
		sets: make(map[string]DataSetInterface),
	}
}

func (m *DataSetManager) gcDataSource() {

}

func genDataSet(ds common.DataSet) DataSetInterface {
	//	switch common.ToSourceType(ds.Type) {
	//	case common.MYSQL:
	//		return NewMySQL(&ds)
	//	case common.INFLUXDB:
	//		return NewInfluxDB(&ds)
	//	default:
	//		return nil
	//	}
	return ds
}

func (m *DataSetManager) Get(ds common.DataSet) DataSetInterface {
	if v, ok := m.sets[ds.Id]; !ok {
		dsi := genDataSet(ds).(DataSetInterface)
		m.sets[ds.Id] = dsi
		return dsi
	} else {
		return v
	}
	return nil
}
