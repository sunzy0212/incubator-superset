package data

type TagData struct {
	Type  string          `json:"type"`
	Tags  []string        `json:"tags"`
	Datas [][]interface{} `json:"datas"`
}

type TagTimeData struct {
	Type  string      `json:"type"`
	Tags  []string    `json:"tags"`
	Times []string    `json:"times"`
	Datas [][]float64 `json:"datas"`
}
type QueryBase interface {
	QueryImpl(chartType string, code string) (interface{}, error)
}

type DataSourceInterface interface {
	TestConn() (bool, error)
	ShowTables() (map[string]string, error)
	Schema(string) ([]map[string]string, error)
}

type DataSetInterface interface {
}
