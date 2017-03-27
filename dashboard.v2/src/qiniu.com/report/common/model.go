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

type DataFormatType int32

const (
	JSON DataFormatType = iota
	CSV
	EXCEL
)

var (
	dataTypeNames = map[DataFormatType]string{
		JSON:  "json",
		CSV:   "csv",
		EXCEL: "excel",
	}
)

func (t DataFormatType) String() string {
	if name := dataTypeNames[t]; name != "" {
		return name
	}
	return "Unknown"
}

func ToDataFormatType(src string) DataFormatType {
	for k, v := range dataTypeNames {
		if v == strings.ToLower(src) {
			return k
		}
	}
	return JSON
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
	DataSetColl    mgoutil.Collection `coll:"dataset"`
	CodeColl       mgoutil.Collection `coll:"code"`
	DirColl        mgoutil.Collection `coll:"dir"`
	ReportColl     mgoutil.Collection `coll:"report"`
	ChartColl      mgoutil.Collection `coll:"chart"`
	LayoutColl     mgoutil.Collection `coll:"layout"`
	CrontabColl    mgoutil.Collection `coll:"crontab"`
	TemplateColl   mgoutil.Collection `coll:"template"`
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
	NickName   string `json:"nickName" bson:"nickName"`
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
	DatasourceId string `json:"datasourceId" bson:"datasourceId"`
	Table        string `json:"table" bson:"table"`
}

type Relationship struct {
	Left     DataSourceTable `json:"left" bson:"left"`
	Right    DataSourceTable `json:"right" bson:"right"`
	Relation RelationType    `json:"relation" bson:"relation"`
}

type Field struct {
	Datasource DataSourceTable `json:"datasource" bson:"datasource"`
	Name       string          `json:"name" bson:"name"`
	Type       string          `json:"type" bson:"type"`
	Alias      string          `json:"alias" bson:"alias"`
	Action     string          `json:"action" bson:"action"`
	Transform  string          `json:"transform" bson:"transform"`
	Unit       string          `json:"unit" bson:"unit"`
}

type Dimension struct {
	Field
}

type Measure struct {
	Field
}
type TimeField struct {
	Field
}

type DataSet struct {
	Id            string                     `json:"id" bson:"id"`
	Name          string                     `json:"name" bson:"name"`
	DataSources   map[string]DataSourceTable `json:"datasources" bson:"datasources"`
	Relationships []Relationship             `json:"relationships" bson:"relationships"`
	Dimensions    []Dimension                `json:"dimensions" bson:"dimensions"`
	Measures      []Measure                  `json:"measures" bson:"measures"`
	Times         []TimeField                `json:"times" bson:"times"`
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
	Id         string `json:"id" bson:"id"`
	Type       string `json:"type" bson:"type"`
	Name       string `json:"name" bson:"name"`
	Pre        string `json:"pre" bson:"pre"`
	Post       string `json:"post" bson:"post"`
	AccessTime string `json:"accessTime" bson:"accessTime"`
}

// 表达式
type Evaluation struct {
	Field    Field  `json:"field" bson:"field"`
	Operator string `json:"operator" bson:"operator"`
	Data     string `json:"data" bson:"data"`
}

// 表达式
type Condition struct {
	Operator string `json:"operator" bson:"operator"`
	Data     string `json:"data" bson:"data"`
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
	Id           string       `json:"id" bson:"id"`
	Name         string       `json:"name" bson:"name"`
	DatasetId    string       `json:"datasetId" bson:"datasetId"`
	SelectFields []Field      `json:"selectFields" bson:"selectFields"`
	MetricFields []Field      `json:"metricFields" bson:"metricFields"`
	GroupFields  []Field      `json:"groupFields" bson:"groupFields"`
	TimeFields   []Evaluation `json:"timeFields" bson:"timeFields"`
	RangeTimes   []Condition  `json:"rangeTimes" bson:"rangeTimes"`
	Wheres       []Evaluation `json:"wheres" bson:"wheres"`
	Havings      []Evaluation `json:"havings" bson:"havings"`
	CreateTime   string       `json:"createTime" bson:"createTime"`
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
	IsTemplate bool   `json:"isTemplate" bson:"isTemplate"`
	CreateTime string `json:"createTime" bson:"createTime"`
}

type Email struct {
	Subject  string   `json:"subject"`
	Username string   `json:"username" bson:"username"`
	Password string   `json:"password" bson:"password"`
	Receiver []string `json:"receiver" bson:"receiver"`
	CronId   string   `json:"cronId" bson:"cronId"`
}
type Reporter struct {
	ReportId string   `json:"reportId" bson:"reportId"`
	PreDirId string   `json:"preDirId" bson:"preDirId"`
	Name     string   `json:"name" bson:"name"`
	Rules    []string `json:"rules" bson:"rules"`
	CronId   string   `json:"cronId" bson:"cronId"`
}

type Template struct {
	Id         string             `json:"id" bson:"id"`
	Name       string             `json:"name" bson:"name"`
	Email      Email              `json:"email" bson:"email"`
	Reporter   Reporter           `json:"reporter" bson:"reporter"`
	Crons      map[string]Crontab `json:"crons" bson:"-"`
	ReportId   string             `json:"reportId" bson:"reportId"`
	CreateTime string             `json:"createTime" bson:"createTime"`
	UpdateTime string             `json:"updateTime" bson:"updateTime"`
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
	Id       string  `json:"id" bson:"id"`
	Type     string  `json:"type" bson:"type"`
	Title    string  `json:"title" bson:"title"`
	SubTitle string  `json:"subTitle" bson:"subTitle"`
	Stack    bool    `json:"stack" bson:"stack"`
	Xaxis    []Field `json:"xaxis" bson:"xaxis"`
	Yaxis    []Field `json:"yaxis" bson:"yaxis"`
	Filters  []Field `json:"filters" bson:"filters"`
	CodeId   string  `json:"codeId" bson:"codeId"`
	DirId    string  `json:"dirId" bson:"dirId"`
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

type Crontab struct {
	Id         string      `json:"id" bson:"id"`
	Name       string      `json:"name" bson:"name"`
	Type       string      `json:"type" bson:"type"`
	Cron       string      `json:"cron" bson:"cron"`
	JobId      int         `json:"jobId" bson:"jobId"`
	Rules      []string    `json:"rules" bson:"rules"`
	Spec       interface{} `json:"spec" bson:"spec"`
	CreateTime string      `json:"createTime" bson:"createTime"`
	UpdateTime string      `json:"updateTime" bson:"updateTime"`
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
