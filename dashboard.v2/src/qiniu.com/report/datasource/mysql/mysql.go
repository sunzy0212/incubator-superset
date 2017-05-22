package mysql

import (
	"encoding/base64"
	"fmt"
	"strings"

	"github.com/qiniu/log.v1"
	"github.com/siddontang/go-mysql/client"

	"qiniu.com/report/common"
	. "qiniu.com/report/datasource"
	"qiniu.com/report/rest"
)

type MySQL struct {
	*common.DataSource
}

func NewMySQL(cfg *common.DataSource) (*MySQL, error) {
	return &MySQL{cfg}, nil
}

func (m *MySQL) TestConn() (bool, error) {
	_, err := m.GetConn()
	if err != nil {
		return false, err
	}
	return true, nil
}

func (m *MySQL) ListDatabases() (RetDatabases, error) {
	return RetDatabases{}, nil
}

func (m *MySQL) ListTables() (RetTables, error) {
	return RetTables{}, nil
}

func (m *MySQL) GenStorage() rest.Storage {
	data, err := base64.StdEncoding.DecodeString(m.Password)
	if err != nil {
		log.Error(err)
	}
	return rest.Storage{
		Name: fmt.Sprintf("%s_%s", m.AppUri, m.Name),
		Config: rest.StorageConfig{
			Type:    "jdbc",
			Enabled: true,
			Driver:  "com.mysql.jdbc.Driver",
			Url: fmt.Sprintf("jdbc:mysql://%s:%d/%s?user=%s&password=%s&useUnicode=true&characterEncoding=utf8&autoReconnect=true&autoReconnectForPools=true",
				m.Host, m.Port, m.DbName, m.Username, string(data)),
		},
	}
}

func (m *MySQL) getFieldTypeFromSourceType(src string) string {
	numBerTypes := []string{"int", "tinyint", "smallint", "mediumint", "bigint", "float", "double", "decimal"}
	stringTypes := []string{"text", "char", "varchar"}
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

func (m *MySQL) Schema(tableName string) (RetSchema, error) {
	ret := RetSchema{}
	conn, err := m.GetConn()
	if err != nil {
		return RetSchema{}, err
	}
	res, err := conn.Execute(fmt.Sprintf("desc %s;", tableName))
	if err != nil {
		return ret, err
	}

	for i := 0; i < res.RowNumber(); i++ {
		field, err := res.GetStringByName(i, "Field")
		dtype, err := res.GetStringByName(i, "Type")
		if err != nil {
			log.Error(err)
			continue
		}
		ret.Fields = append(ret.Fields, Field{Name: field, Type: m.getFieldTypeFromSourceType(dtype)})
	}
	return ret, nil
}

func (m *MySQL) GetConn() (*client.Conn, error) {
	data, err := base64.StdEncoding.DecodeString(m.Password)
	if err != nil {
		log.Error(err)
	}
	return client.Connect(fmt.Sprintf("%s:%d", m.Host, m.Port), m.Username, string(data), m.DbName)
}

func (m *MySQL) Query(args interface{}) (rest.Results, error) {
	return rest.Results{}, fmt.Errorf("This type [%s] does not need to be supported temporary", m.Type)
}
