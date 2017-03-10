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
	selectFields := querys["selectFields"].([]interface{})
	selectSection := ""
	if len(selectFields) == 0 {
		selectSection = "*"
	} else {
		_selectFields := make([]string, 0)
		for _, v := range selectFields {
			_selectFields = append(_selectFields, fmt.Sprintf("`%s`", v.(string)))
		}
		selectSection = strings.Join(_selectFields, ",")
	}

	formFields := make([]string, 0)
	fmt.Println(dataset.DataSources)
	for _, ds := range dataset.DataSources {
		var datasource common.DataSource
		fmt.Println(ds, "========", ds.DatasourceId)
		if err = m.DataSourceColl.Find(M{"id": ds.DatasourceId}).One(&datasource); err != nil {
			log.Errorf("failed to get datasource by id[%s] ~ %v", ds.DatasourceId, err)
			return
		}
		formFields = append(formFields, fmt.Sprintf("%s.%s.%s", datasource.Name, datasource.DbName, ds.Table))
	}
	fromSection := strings.Join(formFields, ",")
	sql = fmt.Sprintf("SELECT %s FROM %s", selectSection, fromSection)
	return
}
