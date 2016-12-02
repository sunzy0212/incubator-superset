package data

import (
	"qiniu.com/report/common"
)

type TagData struct {
	Tags  []string
	Datas [][]string
}

type TagTimeData struct {
	Tags  []string
	Times []string
	Datas [][]float64
}

type Query interface {
	Query(chartType string, code common.Code) interface{}
}
