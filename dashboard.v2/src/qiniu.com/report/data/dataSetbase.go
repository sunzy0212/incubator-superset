package data

import (
	"fmt"
	"strings"
	"sync"

	"github.com/qiniu/log.v1"
	"qiniu.com/report/common"
)

type M map[string]interface{}
type DataSetManager struct {
	mux *sync.RWMutex
	*common.Collections
	// dataSourceManager *DataSourceManager
	codes map[string]common.Code //缓存起连接来，定期清理
}

func NewDataSetManager(colls *common.Collections) *DataSetManager {
	return &DataSetManager{
		Collections: colls,
		mux:         &sync.RWMutex{},
		codes:       make(map[string]common.Code),
	}
}

func (m *DataSetManager) GenSqlFromCode(code common.Code) (sql string, err error) {
	var dataset common.DataSet
	if err = m.DataSetColl.Find(M{"id": code.DatasetId}).One(&dataset); err != nil {
		log.Error(err)
		return
	}

	querys := code.Querys
	//SELECT SECTION
	selectFields := querys["selectFields"]
	selectSection := ""
	if selectFields == nil || len(selectFields.([]interface{})) == 0 {
		selectSection = "*"
	} else {
		_selectFields := make([]string, 0)
		for _, v := range selectFields.([]interface{}) {
			_selectFields = append(_selectFields, fmt.Sprintf("`%s`", v.(string)))
		}
		selectSection = strings.Join(_selectFields, ",")
	}

	//FROM SECTION
	formFields := make([]string, 0)
	for _, ds := range dataset.DataSources {
		var datasource common.DataSource
		if err = m.DataSourceColl.Find(M{"id": ds.DatasourceId}).One(&datasource); err != nil {
			log.Errorf("failed to get datasource by id[%s] ~ %v", ds.DatasourceId, err)
			return
		}
		formFields = append(formFields, fmt.Sprintf("%s.%s.%s", datasource.Name, datasource.DbName, ds.Table))
	}
	fromSection := strings.Join(formFields, ",")
	sql = fmt.Sprintf("SELECT %s FROM %s", selectSection, fromSection)

	//GROUPBY SECTION
	tmpGroupFields := querys["groupFields"]
	if tmpGroupFields != nil && len(tmpGroupFields.([]interface{})) != 0 {
		groupFields := make([]string, 0)
		for _, v := range tmpGroupFields.([]interface{}) {
			groupFields = append(groupFields, fmt.Sprintf("`%s`", v.(string)))
		}
		sql += fmt.Sprintf(" GROUP BY %s ", strings.Join(groupFields, ","))
	}

	addOns := querys["addOns"]
	if addOns == nil || len(addOns.(map[string]interface{})) == 0 {
		return
	}
	//WHERE SECTION
	tmpWhereFields := addOns.(map[string]interface{})["wheres"]
	if tmpWhereFields != nil && len(tmpWhereFields.([]interface{})) != 0 {
		whereFields := make([]string, 0)
		for _, v := range tmpWhereFields.([]interface{}) {
			addon := v.(map[string]interface{})
			field := addon["field"].(string)
			opera := OP[addon["operator"].(string)]
			data := addon["data"]
			switch data.(type) {
			case int, int64, int32:
				data = data.(int64)
			case float64, float32:
				data = data.(float64)
			case string:
				data = fmt.Sprintf("'%s'", data)
			default:
				fmt.Println("没匹配到") //TODO
			}
			whereFields = append(whereFields, fmt.Sprintf(" `%s` %s %v ", field, opera, data))
		}
		sql += fmt.Sprintf(" WHERE %s ", strings.Join(whereFields, " AND ")) //OR转化为AND?暂定
	}

	//Having SECTION
	//TODO having的规则，必须要groupBY语义下。
	tmpHavingFields := addOns.(map[string]interface{})["havings"]
	if tmpHavingFields != nil && len(tmpHavingFields.([]interface{})) != 0 {
		havingFields := make([]string, 0)
		for _, v := range tmpHavingFields.([]interface{}) {
			addon := v.(map[string]interface{})
			field := addon["field"].(string)
			opera := OP[addon["operator"].(string)]
			data := addon["data"]
			switch data.(type) {
			case int, int64, int32:
				data = data.(int64)
			case float64, float32:
				data = data.(float64)
			default:
				fmt.Println("没匹配到") //TODO
			}
			havingFields = append(havingFields, fmt.Sprintf(" `%s` %s %v ", field, opera, data))
		}
		sql += fmt.Sprintf(" HAVING %s ", strings.Join(havingFields, " AND ")) //OR转化为AND?暂定
	}
	return
}
