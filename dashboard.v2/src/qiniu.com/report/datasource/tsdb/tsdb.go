package tsdb

import (
	"fmt"
	"strings"

	"qiniu.com/report/common"
	"qiniu.com/report/rest"
	"qiniupkg.com/x/log.v7"

	"qiniu.com/pandora/base"
	"qiniu.com/pandora/base/config"
	"qiniu.com/pandora/tsdb"
	. "qiniu.com/report/datasource"
)

type TSDB struct {
	*common.DataSource
	client tsdb.TsdbAPI
}

func NewTSDB(cfg *common.DataSource) (*TSDB, error) {
	endpoint := cfg.Host
	ak := cfg.Username
	sk := cfg.Password
	logger := base.NewDefaultLogger()
	tsdbCfg := config.NewConfig().
		WithEndpoint(endpoint).
		WithAccessKeySecretKey(ak, sk).
		WithLogger(logger)

	var err error
	client, err := tsdb.New(tsdbCfg)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	return &TSDB{cfg, client}, nil
}

func (m *TSDB) GenStorage() rest.Storage {
	return rest.Storage{}
}

func (m *TSDB) ListDatabases() (RetDatabases, error) {
	dbs := make([]Database, 0)
	repos, err := m.client.ListRepos(&tsdb.ListReposInput{})
	if err != nil {
		log.Error(err)
		return RetDatabases{dbs}, err
	}
	for _, v := range []tsdb.RepoDesc(*repos) {
		dbs = append(dbs, Database{Name: v.RepoName})
	}
	return RetDatabases{dbs}, nil
}

func (m *TSDB) ListTables() (RetTables, error) {
	tables := make([]Table, 0)
	series, err := m.client.ListSeries(&tsdb.ListSeriesInput{RepoName: m.DbName})
	if err != nil {
		log.Error(err)
		return RetTables{}, nil
	}
	for _, v := range []tsdb.SeriesDesc(*series) {
		tables = append(tables, Table{Name: v.Name})
	}
	return RetTables{tables}, nil
}

func (m *TSDB) Schema(table string) (RetSchema, error) {
	ret := RetSchema{}
	res, err := m.client.QueryPoints(&tsdb.QueryInput{RepoName: m.DbName,
		Sql: fmt.Sprintf("SHOW TAG KEYS FROM %s", table)})
	if err != nil {
		log.Error(err)
		return ret, err
	}

	ret.Fields = append(ret.Fields,
		Field{Name: "time", Type: common.FIELD_TYPE_TIMESTAMP, Transform: "2006-01-02T15:04:05.999Z"})

	if len(res.Results[0].Series) > 0 {
		for _, v := range res.Results[0].Series[0].Values {
			log.Debug(v)
			ret.Fields = append(ret.Fields, Field{Name: v[0].(string),
				Type: common.FIELD_TYPE_STRING})
		}
	}

	res, err = m.client.QueryPoints(&tsdb.QueryInput{RepoName: m.DbName,
		Sql: fmt.Sprintf("SHOW FIELD KEYS FROM %s", table)})
	if err != nil {
		log.Error(err)
		return ret, err
	}
	if len(res.Results[0].Series) > 0 {
		for _, v := range res.Results[0].Series[0].Values {
			log.Debug(v)
			ret.Fields = append(ret.Fields,
				Field{Name: v[0].(string),
					Type:      m.getFieldTypeFromSourceType(v[1].(string)),
					IsMeasure: true,
				})
		}
	}
	return ret, nil
}

func (m *TSDB) getFieldTypeFromSourceType(src string) string {
	numBerTypes := []string{"int", " integer", "mediumint", "bigint", "float", "double", "decimal"}
	stringTypes := []string{"string", "char", "varchar"}
	dateTypes := []string{"date"}
	tmp := strings.ToLower(src)
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

func (m *TSDB) Query(args interface{}) (rest.Results, error) {
	ret := rest.Results{}
	res, err := m.client.QueryPoints(&tsdb.QueryInput{RepoName: m.DbName, Sql: args.(string)})
	if err != nil {
		log.Error(err)
		return ret, err
	}

	if len(res.Results[0].Series) > 0 {
		serie := res.Results[0].Series[0]
		ret.Columns = serie.Columns
		for _, v := range serie.Values {
			row := make(map[string]interface{})
			for i, f := range serie.Columns {
				if v[i] != nil {
					row[f] = v[i]
				}
			}
			ret.Rows = append(ret.Rows, row)
		}
	}
	return ret, nil
}
