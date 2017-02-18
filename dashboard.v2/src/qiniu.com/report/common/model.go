package common

import (
	"strings"

	"github.com/qiniu/db/mgoutil.v3"
)

type SourceType int32

const (
	MYSQL SourceType = iota
	INFLUXDB
	UNKNOWN
)

var (
	sourceNames = map[SourceType]string{
		MYSQL:    "mysql",
		INFLUXDB: "influxdb",
	}
)

func (t SourceType) String() string {
	if name := sourceNames[t]; name != "" {
		return name
	}
	return "Unknown"
}

func ToSourceType(src string) SourceType {
	for k, v := range sourceNames {
		if v == strings.ToLower(src) {
			return k
		}
	}
	return UNKNOWN
}

type RelationType int32

const (
	INNER_JOIN RelationType = iota
	FULL_JOIN
	LEFT_JOIN
	RIGHT_JOIN
)

var (
	joinTypeNames = map[RelationType]string{
		INNER_JOIN: "inner join",
		FULL_JOIN:  "full join",
		LEFT_JOIN:  "left join",
		RIGHT_JOIN: "right join",
	}
)

func (t RelationType) String() string {
	if name := joinTypeNames[t]; name != "" {
		return name
	}
	return "Unknown"
}

type Collections struct {
	DataSourceColl mgoutil.Collection `coll:"datasource"`
	DataSetColl    mgoutil.Collection `coll:"dateset"`
	CodeColl       mgoutil.Collection `coll:"code"`
	DirColl        mgoutil.Collection `coll:"dir"`
	ReportColl     mgoutil.Collection `coll:"report"`
	ChartColl      mgoutil.Collection `coll:"chart"`
	LayoutColl     mgoutil.Collection `coll:"layout"`
}

/*
	id		string
	name		string
	host		string
	port			int
	type			string  //数据源类型：可选MYSQL/MGO/Spark...
	dbName		string
	username			string
	password			string
	createTime		timestamp
*/
type DataSource struct {
	Id         string `json:"id" bson:"id"`
	Name       string `json:"name" bson:"name"`
	Host       string `json:"host" bson:"host"`
	Port       int    `json:"port" bson:"port"`
	Type       string `json:"type" bson:"type"`
	DbName     string `json:"dbName" bson:"dbName"`
	Username   string `json:"username" bson:"username"`
	Password   string `json:"password" bson:"password"`
	CreateTime string `json:"createTime" bson:"createTime"`
}

///////////////////////////////////dataset

type DataSourceTable struct {
	DatasourceId string `json:"dataSourceId" bson:"dataSourceId"`
	Name         string `json:"name" bson:"name"`
}

type Relationship struct {
	Left     DataSourceTable `json:"left" bson:"left"`
	Right    DataSourceTable `json:"right" bson:"right"`
	Relation RelationType    `json:"relation" bson:"relation"`
}
type Dimension struct {
	Name  string `json:"name" bson:"name"`
	Alias string `json:"alias" bson:"alias"`
}

type Measure struct {
	Name   string `json:"name" bson:"name"`
	Alias  string `json:"alias" bson:"alias"`
	Action string `json:"action" bson:"action"`
}

type DataSet struct {
	Id            string                     `json:"id" bson:"id"`
	Name          string                     `json:"name" bson:"name"`
	DataSources   map[string]DataSourceTable `json:"datasources" bson:"datasources"`
	Relationships []Relationship             `json:"relationships" bson:"relationships"`
	Dimensions    []Dimension                `json:"dimensions" bson:"dimensions"`
	Measures      []Measure                  `json:"measures" bson:"measures"`
	Time          string                     `json:"time" bson:"time"`
	CreateTime    string                     `json:"createTime" bson:"createTime"`
	UpdateTime    string                     `json:"updateTime" bson:"updateTime"`
}

/*
{
	"id" : <id>,
	"name" : <Name>,
	"pre" : <PreDir>,
	"post" : <PostDir>
}
*/
type Dir struct {
	Id   string `json:"id" bson:"id"`
	Name string `json:"name" bson:"name"`
	Pre  string `json:"pre" bson:"pre"`
	Post string `json:"post" bson:"post"`
}

/*
{
    id      string
    name    string
    code    string
    datasetId   string
    type    string
    createTime timestamp
}
*/
type Code struct {
	Id         string `json:"id" bson:"id"`
	Name       string `json:"name" bson:"name"`
	Code       string `json:"code" bson:"code"`
	DatasetId  string `json:"datasetId" bson:"datasetId"`
	Type       string `json:"type" bson:"type"`
	CreateTime string `json:"createTime" bson:"createTime"`
}

/**report
{
    id string
    name string
    createTime timestamp
}
*/
type Report struct {
	Id         string `json:"id" bson:"id"`
	DirId      string `json:"dirId" bson:"dirId"`
	Name       string `json:"name" bson:"name"`
	CreateTime string `json:"createTime" bson:"createTime"`
}

/*
{
    id string,
    title string,
    subTitle string,
    type string, //图表类型
    stack bool,
    codeId string <ref code.id>
	reportId string <ref report.id>
}
*/
type Chart struct {
	Id       string `json:"id" bson:"id"`
	Type     string `json:"type" bson:"type"`
	Title    string `json:"title" bson:"title"`
	SubTitle string `json:"subTitle" bson:"subTitle"`
	Stack    bool   `json:"stack" bson:"stack"`
	CodeId   string `json:"codeId" bson:"codeId"`
	ReportId string `json:"reportId" bson:"reportId"`
}

/*
{
    reportId  string ,
    layouts   []map[string]interface
}
*/
type Layout struct {
	ReportId string                   `json:"reportId" bson:"reportId"`
	Layouts  []map[string]interface{} `json:"layouts" bson:"layouts"`
}

func (db *Collections) EnsureIndex() {
	db.DataSourceColl.EnsureIndexes("id,type :unique")
	db.DataSetColl.EnsureIndexes("id:unique")
	db.CodeColl.EnsureIndexes("type")
	db.DirColl.EnsureIndexes("id :unique", "name:unique")
	//db.ReportColl.EnsureIndexes("id,dirId,name :unique")
	db.ChartColl.EnsureIndexes("reportId")
	//db.Code.EnsureIndexes("")
}
