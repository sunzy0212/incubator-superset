package data

import (
	"qiniu.com/report/common"
)

type TagData struct {
	Type  string     `json:"type"`
	Tags  []string   `json:"tags"`
	Datas [][]string `json:"datas"`
}

type TagTimeData struct {
	Type  string      `json:"type"`
	Tags  []string    `json:"tags"`
	Times []string    `json:"times"`
	Datas [][]float64 `json:"datas"`
}

type Query interface {
	Query(chartType string, code common.Code) interface{}
}
