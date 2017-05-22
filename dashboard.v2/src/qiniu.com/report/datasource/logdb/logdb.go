package logdb

import (
	"strings"

	"qiniu.com/report/common"
	"qiniu.com/report/rest"
	"qiniupkg.com/x/log.v7"

	"qiniu.com/pandora/base"
	"qiniu.com/pandora/base/config"
	"qiniu.com/pandora/logdb"
	. "qiniu.com/report/datasource"
)

type LogDB struct {
	*common.DataSource
	client logdb.LogdbAPI
}

func NewLogDB(cfg *common.DataSource) (*LogDB, error) {
	endpoint := cfg.Host
	ak := cfg.Username
	sk := cfg.Password
	logger := base.NewDefaultLogger()
	logdbCfg := config.NewConfig().
		WithEndpoint(endpoint).
		WithAccessKeySecretKey(ak, sk).
		WithLogger(logger)

	var err error
	client, err := logdb.New(logdbCfg)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	return &LogDB{cfg, client}, nil
}

func (m *LogDB) GenStorage() rest.Storage {
	return rest.Storage{}
}

//Methods that do not need to be implemented just to testing conn
func (m *LogDB) ListDatabases() (RetDatabases, error) {
	dbs := make([]Database, 0)
	repos, err := m.client.ListRepos(&logdb.ListReposInput{})
	if err != nil {
		log.Error(err)
		return RetDatabases{dbs}, err
	}
	for _, v := range repos.Repos {
		dbs = append(dbs, Database{Name: v.RepoName})
	}
	return RetDatabases{dbs}, nil
}

func (m *LogDB) ListTables() (RetTables, error) {
	tables := make([]Table, 0)
	repos, err := m.client.ListRepos(&logdb.ListReposInput{})
	if err != nil {
		log.Error(err)
		return RetTables{tables}, err
	}
	log.Info("%#v", repos)
	for _, v := range repos.Repos {
		tables = append(tables, Table{Name: v.RepoName})
	}
	return RetTables{tables}, nil
}

func (m *LogDB) Schema(table string) (RetSchema, error) {
	ret := RetSchema{}
	res, err := m.client.GetRepo(&logdb.GetRepoInput{RepoName: table})
	if err != nil {
		log.Error(err)
		return ret, err
	}
	for _, v := range res.Schema {
		f := Field{Name: v.Key, Type: m.getFieldTypeFromSourceType(v.ValueType)}
		if f.Type == common.FIELD_TYPE_TIMESTAMP {
			f.Transform = "2006-01-02T15:04:05.999Z"
		}
		ret.Fields = append(ret.Fields, f)
	}
	return ret, nil
}

func (m *LogDB) getFieldTypeFromSourceType(src string) string {
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

type LogdbQueryArgs struct {
	RepoName string
	Query    string
	Sort     string
	From     int
	Size     int
}

func (m *LogDB) Query(args interface{}) (rest.Results, error) {
	ret := rest.Results{}
	switch ag := args.(type) {
	case *logdb.QueryLogInput:
		res, err := m.client.QueryLog(ag)
		if err != nil {
			return ret, err
		}
		ret.Rows = res.Data
	}
	return ret, nil
}
