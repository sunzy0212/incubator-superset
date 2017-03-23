package data

import (
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"

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

func (m *DataSetManager) GenSqlFromCode(cfg QueryConfig) (sql string, err error) {
	code := cfg.Code
	var dataset common.DataSet
	if err = m.DataSetColl.Find(M{"id": code.DatasetId}).One(&dataset); err != nil {
		log.Error(err)
		return
	}

	//SELECT SECTION
	selectFields := code.SelectFields
	selectSection := ""
	if selectFields == nil || len(selectFields) == 0 {
		selectSection = "*"
	} else {
		_selectFields := make([]string, 0)
		for _, v := range selectFields {
			_selectFields = append(_selectFields, fmt.Sprintf("`%s`", v.Name))
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

	//WHERE SECTION
	tmpWhereFields := code.Wheres
	if tmpWhereFields != nil && len(tmpWhereFields) != 0 {
		whereFields := make([]string, 0)
		for _, v := range tmpWhereFields {
			field := v.Field.Name
			opera := OP[v.Operator]
			evaluation := ""
			switch strings.ToLower(v.Field.Type) {
			case "number":
				data, err := strconv.ParseFloat(v.Data, 64)
				if err != nil {
					log.Errorf("error while parse %v to float", v.Data)
				}
				evaluation = fmt.Sprintf(" `%s` %s %v ", field, opera, data)
			case "string":
				evaluation = fmt.Sprintf(" `%s` %s '%v' ", field, opera, v.Data)
			default:
				fmt.Println("没匹配到") //TODO String is ok
			}
			whereFields = append(whereFields, evaluation)
		}
		sql += fmt.Sprintf(" WHERE %s ", strings.Join(whereFields, " AND ")) //OR转化为AND?暂定
	}

	//TIMEFIELDS SECTION
	tmpTimeFields := code.TimeFields
	if tmpTimeFields != nil && len(tmpTimeFields) != 0 {
		timeFields := make([]string, 0)
		for _, v := range tmpTimeFields {
			field := v.Field.Name
			opera := OP[v.Operator]
			evaluation := ""
			switch strings.ToLower(v.Field.Type) {
			case "timestamp":
				tsNumber, _ := strconv.ParseInt(v.Data, 10, 64)
				tsDate := time.Unix(tsNumber/1000, tsNumber%1000*1e+09)
				ts := tsDate.Format(v.Field.Transform)
				evaluation = fmt.Sprintf(" `%s` %s '%v' ", field, opera, ts)
			default:
				fmt.Println("没匹配到") //TODO String is ok
			}
			timeFields = append(timeFields, evaluation)
		}
		if tmpWhereFields == nil || len(tmpWhereFields) == 0 {
			sql += fmt.Sprintf(" WHERE %s ", strings.Join(timeFields, " AND "))
		} else {
			sql += fmt.Sprintf(" AND %s ", strings.Join(timeFields, " AND "))
		}

	}

	//RANGETIMES SECTION
	tmpRangeTimes := code.RangeTimes
	if tmpRangeTimes != nil && len(tmpRangeTimes) != 0 && len(dataset.Times) != 0 {
		timeFields := make([]string, 0)

		//get timefield from dataset
		timeField := dataset.Times[0].Field
		for _, v := range tmpRangeTimes {
			field := timeField.Name
			opera := OP[v.Operator]
			evaluation := ""
			switch strings.ToLower(timeField.Type) {
			case "timestamp":
				tsNumber, _ := strconv.ParseInt(v.Data, 10, 64)
				tsDate := time.Unix(tsNumber/1000, tsNumber%1000*1e+09)
				ts := tsDate.Format(timeField.Transform)
				evaluation = fmt.Sprintf(" `%s` %s '%v' ", field, opera, ts)
			default:
				fmt.Println("没匹配到") //TODO String is ok
			}
			timeFields = append(timeFields, evaluation)
		}
		if tmpWhereFields == nil || len(tmpWhereFields) == 0 {
			sql += fmt.Sprintf(" WHERE %s ", strings.Join(timeFields, " AND "))
		} else {
			sql += fmt.Sprintf(" AND %s ", strings.Join(timeFields, " AND "))
		}

	}

	//GROUPBY SECTION
	tmpGroupFields := code.GroupFields
	if tmpGroupFields != nil && len(tmpGroupFields) != 0 {
		groupFields := make([]string, 0)
		for _, v := range tmpGroupFields {
			groupFields = append(groupFields, fmt.Sprintf("`%s`", v.Name))
		}
		sql += fmt.Sprintf(" GROUP BY %s ", strings.Join(groupFields, ","))
	}

	//Having SECTION
	//TODO having的规则，必须要groupBY语义下。
	tmpHavingFields := code.Havings
	if tmpHavingFields != nil && len(tmpHavingFields) != 0 {
		havingFields := make([]string, 0)
		for _, v := range tmpHavingFields {
			field := v.Field.Name
			opera := OP[v.Operator]
			evaluation := ""
			switch strings.ToLower(v.Field.Type) {
			case "number":
				data, err := strconv.ParseFloat(v.Data, 64)
				if err != nil {
					log.Errorf("error while parse %v to float", v.Data)
				}
				evaluation = fmt.Sprintf(" `%s` %s %v ", field, opera, data)
			case "string":
				evaluation = fmt.Sprintf(" `%s` %s '%v' ", field, opera, v.Data)
			default:
				fmt.Println("没匹配到") //TODO String is ok
			}
			havingFields = append(havingFields, evaluation)
		}
		sql += fmt.Sprintf(" HAVING %s ", strings.Join(havingFields, " AND ")) //OR转化为AND?暂定
	}
	return
}
