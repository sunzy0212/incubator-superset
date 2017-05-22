package data

import (
	"fmt"
	"strings"

	"github.com/qiniu/log.v1"

	"qiniu.com/report/common"
	"qiniu.com/report/datasource"
	"qiniu.com/report/rest"
)

type QueryConfig struct {
	Limit      int64
	DataFormat common.DataFormatType
	Code       common.Code
}

type Executor struct {
	colls             *common.Collections
	client            rest.Client
	dataSetManager    *DataSetManager
	dataSourceManager *DataSourceManager
}

func NewExecutor(colls *common.Collections, restUrls []string) *Executor {
	return &Executor{
		colls:             colls,
		client:            rest.NewDrillClient(restUrls),
		dataSetManager:    NewDataSetManager(colls),
		dataSourceManager: NewDataSourceManager(),
	}
}

type RetDatabases struct {
	Databases []map[string]string `json:"databases"`
}

func (e *Executor) ListDatabases(ds common.DataSource) (ret datasource.RetDatabases, err error) {
	ret = datasource.RetDatabases{}
	datasource, err := e.dataSourceManager.Get(ds, false)
	if err != nil {
		return ret, err
	}
	if ret, err = datasource.ListDatabases(); err != nil {
		return ret, err
	}

	log.Infof("success to get databases")

	return
}

func (e *Executor) ShowTables(ds common.DataSource) (ret datasource.RetTables, err error) {
	// "SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.`TABLES` where TABLE_SCHEMA='192_168_0_102_wo.test';"
	ret = datasource.RetTables{}
	switch common.ToSourceType(ds.Type) {
	case common.TSDB, common.INFLUXDB, common.LOGDB:
		handler, err1 := e.dataSourceManager.Get(ds, true)
		if err != nil {
			log.Error(err1)
			err = err1
			return
		}
		return handler.ListTables()

	case common.MYSQL, common.MONGODB:
		dbSpec := fmt.Sprintf("%s_%s.%s", ds.AppUri, ds.Name, ds.DbName)
		sql := fmt.Sprintf("SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.`TABLES` where TABLE_SCHEMA='%s'", dbSpec)
		log.Debugf("query SQL[%s]", sql)

		res, err1 := e.client.Query(sql)
		if err1 != nil {
			log.Error(err1)
			err = err1
			return
		}

		for _, v := range res.Rows {
			ret.Tables = append(ret.Tables, datasource.Table{Name: v["TABLE_NAME"].(string)})
		}
	case common.DEMO:
		ret.Tables = append(ret.Tables, datasource.Table{Name: "employee.json"})
	}

	log.Infof("success to get %d tables, from schema %s", len(ret.Tables), ds.DbName)

	return
}

func (m *Executor) getFieldTypeFromSourceType(src string) string {
	numBerTypes := []string{"BIGINT", "DOUBLE", "INTEGER", "DECIMAL", "BOOLEAN"} //BOOLEAN暂时归Number
	stringTypes := []string{"CHARACTER", "ANY"}                                  //ANY暂时归String
	dateTypes := []string{"TIMESTAMP"}
	tmp := strings.ToUpper(src)
	for _, v := range numBerTypes {
		if strings.HasPrefix(tmp, v) {
			return common.FIELD_TYPE_NUMBER
		}
	}
	for _, v := range stringTypes {
		if strings.HasPrefix(tmp, v) {
			return common.FIELD_TYPE_STRING
		}
	}
	for _, v := range dateTypes {
		if strings.HasPrefix(tmp, v) {
			return common.FIELD_TYPE_TIMESTAMP
		}
	}
	return tmp
}

func (e *Executor) GetTableShema(ds common.DataSource, tableName string) (ret datasource.RetSchema, err error) {
	// "SELECT COLUMN_NAME,DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA='192_168_0_102_wo.test' and TABLE_NAME='sales'"
	switch common.ToSourceType(ds.Type) {
	case common.TSDB, common.INFLUXDB, common.LOGDB:
		handler, err1 := e.dataSourceManager.Get(ds, true)
		if err != nil {
			log.Error(err1)
			err = err1
			return
		}
		return handler.Schema(tableName)
	case common.MYSQL, common.MONGODB:
		dbSpec := fmt.Sprintf("%s_%s.%s", ds.AppUri, ds.Name, ds.DbName)
		sql := fmt.Sprintf("SELECT COLUMN_NAME,DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='%s' AND TABLE_NAME='%s'", dbSpec, tableName)
		log.Debugf("query SQL[%s]", sql)

		ret = datasource.RetSchema{}

		res, err1 := e.client.Query(sql)
		if err != nil {
			log.Error(err1)
			err = err1
			return
		}
		for _, v := range res.Rows {
			ret.Fields = append(ret.Fields,
				datasource.Field{
					Name: v["COLUMN_NAME"].(string),
					Type: e.getFieldTypeFromSourceType(v["DATA_TYPE"].(string))},
			)
		}
	case common.DEMO:
	}

	log.Infof("success to get table info, from table %s.%s", ds.DbName, tableName)
	return
}

func (e *Executor) GetDataByDataSource(ds common.DataSource, tableName string, limit int64) (ret rest.Results, err error) {
	switch common.ToSourceType(ds.Type) {
	case common.TSDB, common.INFLUXDB, common.LOGDB:
		handler, err1 := e.dataSourceManager.Get(ds, true)
		if err != nil {
			log.Error(err1)
			err = err1
			return
		}
		return handler.Query(fmt.Sprintf("SELECT * FROM %s LIMIT %d", tableName, limit))
	case common.MYSQL, common.MONGODB, common.DEMO:
		tableSpec := fmt.Sprintf("%s_%s.%s.%s", ds.AppUri, ds.Name, ds.DbName, tableName)
		sql := fmt.Sprintf("SELECT * FROM %s LIMIT %d", tableSpec, limit)

		if ds.Type == common.DEMO.String() {
			sql = "SELECT * FROM cp.`employee.json` limit 20"
		}

		log.Debugf("query SQL[%s]", sql)

		ret, err = e.client.Query(sql)
		if err != nil {
			log.Error(err)
			return
		}
	}

	log.Infof("success to get result, length=%d from table %s", len(ret.Rows), tableName)
	return
}

func (e *Executor) GetDataByDataSet(ds common.DataSet, limit int64) (ret interface{}, err error) {
	return e.Execute(QueryConfig{Code: common.Code{DatasetId: ds.Id}, DataFormat: common.JSON, Limit: limit})
}

func (e *Executor) Execute(cfg QueryConfig) (ret interface{}, err error) {
	ret = make([]map[string]interface{}, 0)
	log.Debugf("Try get data from code:%#v", cfg.Code)
	sql, err := e.dataSetManager.GenSqlFromCode(cfg)
	if err != nil {
		log.Error(err)
		return
	}

	log.Debugf("Converted SQL[%s]", sql)
	code := cfg.Code
	var dataset common.DataSet
	if err = e.colls.DataSetColl.Find(M{"id": code.DatasetId}).One(&dataset); err != nil {
		log.Error(err)
		return
	}
	var datasourceId string
	for _, v := range dataset.DataSources {
		datasourceId = v.DatasourceId
	}

	var ds common.DataSource
	if err = e.colls.DataSourceColl.Find(M{"id": datasourceId}).One(&ds); err != nil {
		log.Error(err)
		return
	}
	switch common.ToSourceType(ds.Type) {
	case common.TSDB, common.INFLUXDB, common.LOGDB:
		var handler datasource.DataSourceInterface
		if handler, err = e.dataSourceManager.Get(ds, true); err != nil {
			log.Error(err)
			return
		}
		var res rest.Results
		if res, err = handler.Query(strings.Replace(sql, "`", "", -1)); err != nil {
			log.Error(err)
			return
		}
		ret = res.Rows
		return
	case common.MONGODB, common.MYSQL, common.DEMO:
		var res rest.Results
		if res, err = e.client.Query(sql); err != nil {
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
	return
}
