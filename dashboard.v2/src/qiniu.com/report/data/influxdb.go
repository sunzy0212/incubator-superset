package data

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"github.com/qiniu/log.v1"

	"qiniu.com/report/common"
	"qiniu.com/report/rest"
)

type InfluxDB struct {
	*common.DataSource
	client *http.Client
}

func NewInfluxDB(cfg *common.DataSource) *InfluxDB {
	_client := http.DefaultClient
	return &InfluxDB{
		cfg,
		_client,
	}
}

func (m *InfluxDB) TestConn() (bool, error) {
	return true, nil
}

func (m *InfluxDB) ShowTables() (map[string]string, error) {
	return nil, nil
}

func (m *InfluxDB) GenStorage() rest.Storage {
	return rest.Storage{}
}

func (m *InfluxDB) Schema(tableName string) ([]map[string]string, error) {
	ret := make([]map[string]string, 0)
	return ret, nil
}

func (m *InfluxDB) QueryImpl(chartType string, code string) (interface{}, error) {
	params := url.Values{"db": {m.DbName}, "q": {code}}
	req, err := http.NewRequest("GET", m.Host+"?"+params.Encode(), nil)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	resp, err := m.client.Do(req)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer resp.Body.Close()
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		log.Error(string(data))
		return nil, fmt.Errorf("StatusCode:%d,Err:%s", resp.StatusCode, string(data))
	}
	var result InfluxDBResult
	if err = json.Unmarshal(data, &result); err != nil {
		log.Error(err)
		return nil, err
	}
	series := result.Results[0].Series

	switch strings.ToUpper(chartType) {
	case CHART_BAR, CHART_PIE, CHART_LINE:
		ret := TagTimeData{}
		if len(series) == 0 {
			return ret, nil
		}
		ret.Times = make([]string, 0)
		ret.Tags = make([]string, len(series))
		ret.Datas = make([][]float64, len(series))
		if len(series[0].Columns) != 2 {
			return nil, fmt.Errorf("使用Influxdb数据绘图时,暂不支持多个聚合字段")
		}
		aggFiled := series[0].Columns[1]
		for i, serie := range series {
			tags := make([]string, 0)
			for _, v := range serie.Tags {
				tags = append(tags, v)
			}
			tags = append(tags, aggFiled)
			ret.Tags[i] = strings.Join(tags, "-")

			for _, val := range serie.Values {
				if i == 0 {
					ret.Times = append(ret.Times, val[0].(string))
				}
				if val[1] == nil {
					ret.Datas[i] = append(ret.Datas[i], 0)
				} else {
					ret.Datas[i] = append(ret.Datas[i], val[1].(float64))
				}
			}
		}
		return ret, nil

	case CHART_TABLE:
		ret := TagData{}
		if len(series) == 0 {
			return ret, nil
		}
		ret.Tags = make([]string, 0)
		serie := series[0]
		for k, _ := range serie.Tags {
			ret.Tags = append(ret.Tags, k)
		}
		for _, k := range serie.Columns {
			ret.Tags = append(ret.Tags, k)
		}
		ret.Datas = make([][]interface{}, 0)
		for _, serie := range series {
			tmp := make([]interface{}, 0)
			for _, t := range serie.Tags {
				tmp = append(tmp, t)
			}
			for _, record := range serie.Values {
				tmpVal := tmp
				for _, val := range record {
					if val == nil {
						val = ""
					}
					tmpVal = append(tmpVal, val)
				}
				ret.Datas = append(ret.Datas, tmpVal)
			}
		}
		return ret, nil

	default:
	}
	return nil, nil
}

type InfluxDBResult struct {
	Results []Result `json:"results"`
}
type Result struct {
	Series []Serie `json:"series"`
}
type Serie struct {
	Name    string            `json:"name"`
	Tags    map[string]string `json:"tags"`
	Columns []string          `json:"columns"`
	Values  [][]interface{}   `json:"values"`
}
