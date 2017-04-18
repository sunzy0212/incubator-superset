package data

import (
	"fmt"
	"strings"

	"github.com/qiniu/log.v1"

	"qiniu.com/report/common"
	"qiniu.com/report/rest"
)

type QueryConfig struct {
	DataFormat common.DataFormatType
	Code       common.Code
}

type Executor struct {
	colls          *common.Collections
	client         rest.Client
	dataSetManager *DataSetManager
	// dataSourceManager *DataSourceManager
}

func NewExecutor(colls *common.Collections, restUrls []string) *Executor {
	return &Executor{
		client:         rest.NewDrillClient(restUrls),
		dataSetManager: NewDataSetManager(colls),
	}
}

type RetTables struct {
	Tables []map[string]string `json:"tables"`
}

func (e *Executor) ShowTables(ds common.DataSource) (ret RetTables, err error) {
	// "SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.`TABLES` where TABLE_SCHEMA='192_168_0_102_wo.test';"
	dbSpec := fmt.Sprintf("%s_%s.%s", ds.AppUri, ds.Name, ds.DbName)
	sql := fmt.Sprintf("SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.`TABLES` where TABLE_SCHEMA='%s'", dbSpec)
	log.Debugf("query SQL[%s]", sql)

	ret = RetTables{}
	res, err := e.client.Query(sql)
	if err != nil {
		log.Error(err)
		return
	}
	for _, v := range res.Rows {
		ret.Tables = append(ret.Tables,
			map[string]string{
				"name": v["TABLE_NAME"].(string),
				"type": v["TABLE_TYPE"].(string)},
		)
	}
	log.Infof("success to get %d tables, from schema %s", len(res.Rows), dbSpec)

	return
}

func (m *Executor) getFieldTypeFromSourceType(src string) string {
	numBerTypes := []string{"BIGINT", "DOUBLE", "INTEGER", "DECIMAL", "BOOLEAN"} //BOOLEAN暂时归Number
	stringTypes := []string{"CHARACTER", "ANY"}                                  //ANY暂时归String
	dateTypes := []string{"TIMESTAMP"}
	tmp := strings.ToUpper(src)
	for _, v := range numBerTypes {
		if strings.HasPrefix(tmp, v) {
			return FIELD_TYPE_NUMBER
		}
	}
	for _, v := range stringTypes {
		if strings.HasPrefix(tmp, v) {
			return FIELD_TYPE_STRING
		}
	}
	for _, v := range dateTypes {
		if strings.HasPrefix(tmp, v) {
			return FIELD_TYPE_TIMESTAMP
		}
	}
	return tmp
}

func (e *Executor) GetTableShema(ds common.DataSource, tableName string) (ret []map[string]string, err error) {
	// "SELECT COLUMN_NAME,DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA='192_168_0_102_wo.test' and TABLE_NAME='sales'"
	dbSpec := fmt.Sprintf("%s_%s.%s", ds.AppUri, ds.Name, ds.DbName)
	sql := fmt.Sprintf("SELECT COLUMN_NAME,DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='%s' AND TABLE_NAME='%s'", dbSpec, tableName)
	log.Debugf("query SQL[%s]", sql)

	ret = make([]map[string]string, 0)
	res, err := e.client.Query(sql)
	if err != nil {
		log.Error(err)
		return
	}
	for _, v := range res.Rows {
		ret = append(ret,
			map[string]string{
				"field": v["COLUMN_NAME"].(string),
				"type":  e.getFieldTypeFromSourceType(v["DATA_TYPE"].(string))},
		)
	}
	log.Infof("success to get table info, from schema %s", dbSpec)
	return
}

func (e *Executor) GetDataByDataSource(ds common.DataSource, tableName string, limit uint64) (ret rest.Results, err error) {
	tableSpec := fmt.Sprintf("%s_%s.%s.%s", ds.AppUri, ds.Name, ds.DbName, tableName)
	sql := fmt.Sprintf("SELECT * FROM %s LIMIT %d", tableSpec, limit)
	log.Debugf("query SQL[%s]", sql)

	ret, err = e.client.Query(sql)
	if err != nil {
		log.Error(err)
		return
	}
	log.Infof("success to get result, length=%d from table %s", len(ret.Rows), tableSpec)
	return
}

func (e *Executor) Execute(cfg QueryConfig) (ret interface{}, err error) {
	log.Debugf("Try get data from code:%#v", cfg.Code)
	sql, err := e.dataSetManager.GenSqlFromCode(cfg)
	if err != nil {
		log.Error(err)
		return
	}
	log.Debugf("Converted SQL[%s]", sql)
	res, err := e.client.Query(sql)
	if err != nil {
		log.Error(err)
		return
	}
	log.Infof("success to get result , length=%d", len(res.Rows))
	for i, v := range res.Rows {
		log.Debugf("%d -> %#v", i, v)
	}
	if len(res.Rows) == 1 && len(res.Rows[0]) == 0 {
		return make([]string, 0), nil
	}
	return res.Rows, nil
}
