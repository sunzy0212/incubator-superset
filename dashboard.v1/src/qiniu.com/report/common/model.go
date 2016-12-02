package common

import (
	"github.com/qiniu/db/mgoutil.v3"
)

const (
	MYSQL = "mysql"
)

type Collections struct {
	DatasetColl mgoutil.Collection `coll:"dateset"`
	CodeColl    mgoutil.Collection `coll:"code"`
	ReportColl  mgoutil.Collection `coll:"report"`
	ChartColl   mgoutil.Collection `coll:"chart"`
	LayoutColl  mgoutil.Collection `coll:"layout"`
}

/*
	id          string
	host		string
	port		int
    type        string  //数据源类型：可选MYSQL/MGO/Spark...
    dbName      string
    username    string
    password    string
    createTime  timestamp
*/
type Dataset struct {
	Id         string `json:"id" bson:"id"`
	Host       string `json:"host" bson:"host"`
	Port       int    `json:"port" bson:"port"`
	Type       string `json:"type" bson:"type"`
	DbName     string `json:"dbName" bson:"dbName"`
	Username   string `json:"username" bson:"username"`
	Password   string `json:"password" bson:"password"`
	CreateTime string `json:"createTime" bson:"createTime"`
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

	Dataset `bson:"-"`
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
	db.DatasetColl.EnsureIndexes("id,type :unique")
	db.CodeColl.EnsureIndexes("type")
	db.ChartColl.EnsureIndexes("reportId")
	//db.Code.EnsureIndexes("")
}
