package data

import (
	"fmt"
	"regexp"
	"sort"
	"strings"

	"github.com/qiniu/log.v1"
	"github.com/siddontang/go-mysql/client"
	"qiniu.com/report/common"
)

type Mysql struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Db       string `json:"dbName"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func (m *Mysql) Query(chartType string, code common.Code) (interface{}, error) {
	code.Code = strings.TrimRight(strings.TrimSpace(code.Code), ";")
	db, err := m.getConn()
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer db.Close()
	colls := parseCols(code.Code)
	group_fileds := parseGroupCols(code.Code)
	rows, err := db.Execute(code.Code)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	keys := rows.FieldNames //map[string]int {属性名,列下标}

	switch chartType {
	case CHART_LINE, CHART_BAR, CHART_PIE:
		var x_axis []int //保存x轴对应的值的属性字段下标
		var y_axis []int //保存y轴对应的值的属性字段下标
		if len(group_fileds) == 0 {
			collsNum := len(keys)
			if collsNum < 2 {
				return nil, err //select xx from tt 没啥意义吧
			}
			//select x1,x2,...,x(n-1),xn from tt  x1~x(n-1)做x轴，xn做y轴
			for _, index := range keys {
				if index == collsNum-1 {
					y_axis = append(y_axis, index)
				} else {
					x_axis = append(x_axis, index)
				}
			}
		} else {
			//select x1,x2,...,xm,...,xn from tt group by x1,...,xm  x1~xm做x轴，x(m+1)~xn做y轴
			//即group by 后面的做x轴，其他的都做y轴

			for key, index := range keys {
				inGroupFiels := func(key string, groupFileds []string) bool {
					for _, v := range groupFileds {
						if key == v || key == colls[v] {
							return true
						}
					}
					return false
				}

				if inGroupFiels(key, group_fileds) {
					x_axis = append(x_axis, index)
				} else {
					y_axis = append(y_axis, index)
				}
			}
		}

		sort.Ints(x_axis)
		sort.Ints(y_axis)

		ret := TagTimeData{}
		ret.Tags = make([]string, len(y_axis))
		for i, val := range y_axis { //去产生tags的值，其应该为sql 字段名或者别名（若有）
			for k, v := range keys {
				if val == v {
					if alis, ok := colls[k]; ok && alis != "" {
						ret.Tags[i] = alis
					} else {
						ret.Tags[i] = k
					}

				}
			}
		}
		ret.Times = make([]string, 0)
		ret.Datas = make([][]float64, len(y_axis))

		for i := 0; i < rows.RowNumber(); i++ {
			var rx_axis []string
			for _, index := range x_axis {
				var r string
				if r, err = rows.GetString(i, index); err != nil {
					log.Warn(err)
					err = nil
				}
				rx_axis = append(rx_axis, r)
			}
			ret.Times = append(ret.Times, strings.Join(rx_axis, "-"))
			for tagsIndex, index := range y_axis {
				var rs float64
				if rs, err = rows.GetFloat(i, index); err != nil {
					log.Warn(err)
					err = nil
				}
				ret.Datas[tagsIndex] = append(ret.Datas[tagsIndex], rs)
			}
		}

		return ret, nil

	default:
		ret := TagData{}
		ret.Tags = make([]string, len(keys))
		ret.Datas = make([][]string, 0)
		for key, index := range keys {
			if vv, ok := colls[key]; ok && vv != "" {
				ret.Tags[index] = colls[key]
			} else {
				ret.Tags[index] = key
			}
		}
		for i := 0; i < rows.RowNumber(); i++ {
			data := make([]string, len(keys))
			for _, index := range keys {
				var r string
				if r, err = rows.GetString(i, index); err != nil {
					log.Warn(err)
					err = nil
				}
				data[index] = r
			}
			ret.Datas = append(ret.Datas, data)
		}
		return ret, nil
	}

	return nil, err
}

func (m *Mysql) getConn() (*client.Conn, error) {
	return client.Connect(fmt.Sprintf("%s:%d", m.Host, m.Port), m.Username, m.Password, m.Db)
}

var (
	REG_Select  = regexp.MustCompile("select (.+) from")
	REG_Table_1 = regexp.MustCompile("from(.+)(where|group|orderd|having|on)")
	REG_Table_2 = regexp.MustCompile("from(.+)$")

	REG_Group_1 = regexp.MustCompile("group(.+)(orderd|having|on)")
	REG_Group_2 = regexp.MustCompile("group(.+)$")
)

func parseCols(sql string) map[string]string {
	tempReg := REG_Select.FindStringSubmatch(sql)
	if len(tempReg) == 0 {
		return nil
	}
	fileds := make(map[string]string, 0)
	if strings.TrimSpace(tempReg[1]) == "*" {
		return fileds
	}
	tmpFileds := strings.Split(tempReg[1], ",")
	for _, v := range tmpFileds {
		alis := strings.Split(strings.TrimSpace(v), "as")
		if len(alis) == 2 {
			fileds[strings.TrimSpace(alis[0])] =
				strings.Trim(strings.Trim(strings.TrimSpace(alis[1]), "'"), "\"")
		} else {
			fileds[strings.TrimSpace(alis[0])] = ""
		}
	}
	return fileds
}
func parseTables(sql string) []string {
	tempReg := REG_Table_1.FindStringSubmatch(sql)
	var tableNameStr string
	if len(tempReg) == 3 {
		tableNameStr = strings.TrimSpace(tempReg[1])
	}
	if len(tempReg) == 0 {
		tempReg = REG_Table_2.FindStringSubmatch(sql)
		tableNameStr = strings.TrimSpace(tempReg[1])
	}

	_tables := strings.Split(tableNameStr, ",")
	tableNames := make([]string, 0)
	for _, v := range _tables {
		tableNames = append(tableNames, strings.TrimSpace(v))
	}
	return tableNames
}
func parseConditions() {

}
func parseGroupCols(sql string) []string {
	if !strings.Contains(sql, "group") {
		return nil
	}
	tempReg := REG_Group_1.FindStringSubmatch(sql)
	var groupNameStr string
	if len(tempReg) == 3 {
		groupNameStr = strings.TrimSpace(tempReg[1])
	}
	if len(tempReg) == 0 {
		tempReg = REG_Group_2.FindStringSubmatch(sql)
		groupNameStr = strings.TrimSpace(tempReg[1])
	}
	groupNameStr = strings.TrimLeft(groupNameStr, "by")
	_fileds := strings.Split(groupNameStr, ",")
	fileds := make([]string, 0)
	for _, v := range _fileds {
		fileds = append(fileds, strings.TrimSpace(v))
	}
	return fileds
}
func parseOrderCols() {

}
