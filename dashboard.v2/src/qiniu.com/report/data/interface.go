package data

type QueryBase interface {
	QueryImpl(chartType string, code string) (interface{}, error)
}
