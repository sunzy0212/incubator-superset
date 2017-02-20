package data

import (
	"qiniu.com/report/common"
)

type QueryConfig struct {
	common.DataSource
}

var queryHandler = make(map[common.DataSource]QueryBase)

func Query(ds common.DataSource, _code string, _chartType string) (ret interface{}, err error) {
Loop:
	if handler, ok := queryHandler[ds]; ok {
		if ret, err = handler.QueryImpl(_chartType, _code); err != nil {
			return
		}
	} else {
		//初始化query handler
		var handler QueryBase
		switch ds.Type {
		case "MYSQL":
			handler = NewMySQL(&ds)
		case "INFLUXDB":
			handler = NewInfluxDB(&ds)
		default:
			return
		}
		queryHandler[ds] = handler
		goto Loop
	}
	return
}
