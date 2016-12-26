package data

import (
	"qiniu.com/report/common"
)

type QueryConfig struct {
	common.Dataset
}

var queryHandler = make(map[common.Dataset]QueryBase)

func Query(dataset common.Dataset, _code string, _chartType string) (ret interface{}, err error) {
Loop:
	if handler, ok := queryHandler[dataset]; ok {
		if ret, err = handler.QueryImpl(_chartType, _code); err != nil {
			return
		}
	} else {
		//初始化query handler
		var handler QueryBase
		switch dataset.Type {
		case "MYSQL":
			config := MySQLConfig{
				Host:     dataset.Host,
				Port:     dataset.Port,
				Username: dataset.Username,
				Password: dataset.Password,
				Db:       dataset.DbName,
			}
			handler = NewMySQL(&config)
		case "INFLUXDB":
			config := InfluxDBConfig{
				Host: dataset.Host,
				DB:   dataset.DbName,
			}
			handler = NewInfluxDB(&config)
		default:
			return
		}
		queryHandler[dataset] = handler
		goto Loop
	}
	return
}
