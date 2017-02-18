package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strings"
	"sync"

	"gopkg.in/mgo.v2"

	"github.com/qiniu/errors"
	"github.com/qiniu/http/rpcutil.v1"
	"github.com/qiniu/log.v1"

	"qiniu.com/report/common"
	"qiniu.com/report/common/db"
	. "qiniu.com/report/common/errors"
	"qiniu.com/report/data"
)

type M map[string]interface{}

type cmdArgs struct {
	CmdArgs []string
}

type Service struct {
	RWMux *sync.RWMutex
	common.Collections
	dataSourceManager *data.DataSourceManager
}

func NewService(coll common.Collections) (s *Service, err error) {
	s = &Service{
		RWMux:             &sync.RWMutex{},
		Collections:       coll,
		dataSourceManager: data.NewDataSourceManager(),
		//Config:      cfg,
	}
	return s, nil
}

/*
POST /v1/datasources
*/

func (s *Service) PostDatasources(env *rpcutil.Env) (ret common.DataSource, err error) {

	var data []byte

	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req common.DataSource
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostDataSource(err)
		return
	}

	if req.Id, err = common.GenId(); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	req.Id = fmt.Sprintf("datasource_%s", req.Id)
	req.CreateTime = common.GetCurrTime()
	req.Type = strings.ToUpper(req.Type)
	if err = db.DoInsert(s.DataSourceColl, req); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	ret = req
	log.Infof("success to insert datasource: %+v", req)
	return
}

/*
POST /v1/datasources/test
*/
type RetTest struct {
	Result bool `json:"result"`
}

func (s *Service) PostDatasourcesTest(env *rpcutil.Env) (ret RetTest, err error) {
	ret = RetTest{
		Result: false,
	}
	var dataBody []byte
	if dataBody, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req common.DataSource
	if err = json.Unmarshal(dataBody, &req); err != nil {
		err = ErrorPostDataSource(err)
		return
	}
	if b, err1 := s.dataSourceManager.TestConn(req); err != nil {
		err = ErrorTestDataSource(err1)
		return
	} else {
		ret.Result = b
		return
	}
}

/*
PUT /v1/datasources/<Id>
*/
func (s *Service) PutDatasources_(args *cmdArgs, env *rpcutil.Env) (err error) {
	id := args.CmdArgs[0]
	var data []byte
	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}

	var req common.DataSource
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostDataSource(err)
		return
	}
	req.Id = id
	req.Type = strings.ToUpper(req.Type)
	req.CreateTime = common.GetCurrTime()
	err = db.DoUpdate(s.DataSourceColl, M{"id": id}, req)
	if err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	log.Infof("success to update dataSource: %v", req)
	return
}

/*GET /v1/datasources
 */

type RetDataSource struct {
	DataSources []common.DataSource `json:"datasources"`
}

func (s *Service) GetDatasources(env *rpcutil.Env) (ret RetDataSource, err error) {
	ds := make([]common.DataSource, 0)
	if err = s.DataSourceColl.Find(M{}).Sort("-createTime").All(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the datasource is empty !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	ret = RetDataSource{ds}
	log.Infof("success to get all datasources: %v", ret)
	return
}

//DELETE /v1/datasources/<Id>
func (s *Service) DeleteDatasources_(args *cmdArgs, env *rpcutil.Env) (err error) {
	id := args.CmdArgs[0]
	if err = db.DoDelete(s.DataSourceColl, map[string]string{"id": id}); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("%s is not exist", id))
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to delete datasource: %v", id)
	return
}

/*
GET /v1/datasources/<Id>/tables
*/
type RetTables struct {
	Tables []Table `json:"tables"`
}
type Table struct {
	DatasourceId string `json:"datasourceId"`
	Name         string `json:"name"`
	Desc         string `json:"desc"`
}

func (s *Service) GetDatasources_Tables(args *cmdArgs, env *rpcutil.Env) (ret interface{}, err error) {
	id := args.CmdArgs[0]
	var ds common.DataSource
	if err = s.DataSourceColl.Find(M{"id": id}).One(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("datasource id:%s is not exist", id))
			return
		}
		err = errors.Info(ErrInternalError, err)
		return
	}
	res, err1 := s.dataSourceManager.Get(ds).ShowTables()
	if err1 != nil {
		err = ErrorShowTables(err1)
		return
	}

	tables := make([]Table, 0)

	for k, v := range res {
		tables = append(tables, Table{id, k, v})
	}
	ret = RetTables{tables}
	return
}

/*
GET /v1/datasources/<Id>/tables/<TableName>
*/
type TableSchema struct {
	DatasourceId string              `json:"datasourceId"`
	TableName    string              `json:"tableName"`
	Fields       []map[string]string `json:"fields"`
	Desc         string              `json:"desc"`
}

func (s *Service) GetDatasources_Tables_(args *cmdArgs, env *rpcutil.Env) (ret TableSchema, err error) {
	id := args.CmdArgs[0]
	name := args.CmdArgs[1]
	var ds common.DataSource
	if err = s.DataSourceColl.Find(M{"id": id}).One(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("datasource id:%s is not exist", id))
			return
		}
		err = errors.Info(ErrInternalError, err)
		return
	}
	res, err1 := s.dataSourceManager.Get(ds).Schema(name)
	if err1 != nil {
		err = ErrorShowTables(err1)
		return
	}
	ret = TableSchema{DatasourceId: id, TableName: name, Fields: res}
	return
}

//###########################################dataset
/*
POST /v1/datasets
*/

func (s *Service) PostDatasets(env *rpcutil.Env) (ret common.DataSet, err error) {

	var data []byte

	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req common.DataSet
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostDataSet(err)
		return
	}

	if req.Id, err = common.GenId(); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	req.Id = fmt.Sprintf("dataset_%s", req.Id)
	req.CreateTime = common.GetCurrTime()
	req.UpdateTime = common.GetCurrTime()
	if err = db.DoInsert(s.DataSetColl, req); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	ret = req
	log.Infof("success to insert dataset: %+v", req)
	return
}

/*
PUT /v1/datasets/<Id>
*/
func (s *Service) PutDatasets_(args *cmdArgs, env *rpcutil.Env) (ret common.DataSet, err error) {
	id := args.CmdArgs[0]
	var data []byte
	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}

	var req common.DataSet
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostDataSet(err)
		return
	}
	req.Id = id
	req.UpdateTime = common.GetCurrTime()
	err = db.DoUpdate(s.DataSetColl, M{"id": id}, req)
	if err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	ret = req
	log.Infof("success to update dataset: %v", req)
	return
}

/*GET /v1/datasets
 */

type RetDataSet struct {
	DataSets []common.DataSet `json:"datasets"`
}

func (s *Service) GetDatasets(env *rpcutil.Env) (ret RetDataSet, err error) {
	ds := make([]common.DataSet, 0)
	if err = s.DataSetColl.Find(M{}).Sort("-updateTime").All(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the dataset is empty !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	ret = RetDataSet{ds}
	log.Infof("success to get all datasets: %v", ret)
	return
}

//DELETE /v1/datasets/<Id>
func (s *Service) DeleteDatasets_(args *cmdArgs, env *rpcutil.Env) (err error) {
	id := args.CmdArgs[0]
	if err = db.DoDelete(s.DataSetColl, map[string]string{"id": id}); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("%s is not exist", id))
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to delete dataset: %v", id)
	return
}

//###########################################dir
/*
POST /v1/dirs
*/

func (s *Service) PostDirs(env *rpcutil.Env) (ret common.Dir, err error) {

	var data []byte

	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req common.Dir
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostDir(err)
		return
	}
	if req.Pre == "" || !strings.HasPrefix(req.Pre, "dir_") {
		req.Pre = "ROOT"
	}
	var b bool
	if b, err = db.IsExist(s.DirColl, M{"name": req.Name, "pre": req.Pre}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	if b {
		err = ErrorPostDir(fmt.Errorf("dir `%v` is already exist", req.Name))
		return
	}

	if req.Id, err = common.GenId(); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}

	req.Id = fmt.Sprintf("dir_%s", req.Id)
	if err = db.DoInsert(s.DirColl, req); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	ret = req
	log.Infof("success to insert dir: %+v", req)
	return
}

/*
PUT /v1/dirs/<Id>
*/
func (s *Service) PutDirs_(args *cmdArgs, env *rpcutil.Env) (err error) {
	id := args.CmdArgs[0]
	var data []byte
	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		log.Error(err)
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}

	var req common.Dir
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostDir(err)
		return
	}
	if req.Pre == "" || !strings.HasPrefix(req.Pre, "dir_") {
		req.Pre = "ROOT"
	}
	var b bool
	if b, err = db.IsExist(s.DirColl, M{"name": req.Name, "pre": req.Pre, "id": M{"$ne": id}}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	if b {
		err = ErrorPostDir(fmt.Errorf("dir `%v` is already exist", req.Name))
		return
	}

	req.Id = id

	err = db.DoUpdate(s.DirColl, M{"id": id}, req)
	if err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	log.Infof("success to update dir: %v", req)
	return
}

/*GET /v1/dirs
 */

type Dir struct {
	Id     string `json:"id" bson:"id"`
	Name   string `json:"name" bson:"name"`
	Pre    string `json:"pre" bson:"pre"`
	SubDir []Dir  `json:"subDir" bson:"subDir"`
}
type TreeDirs struct {
	Dirs []Dir `json:"dirs"`
}

func (s *Service) GetDirs(env *rpcutil.Env) (ret TreeDirs, err error) {
	ds := make([]common.Dir, 0)
	if err = s.DirColl.Find(M{}).All(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the dir is enpty !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	ret = TreeDirs{genTreeDirs("ROOT", ds)}
	log.Infof("success to get all dirs: %v", ret)
	return
}

func genTreeDirs(root string, dirs []common.Dir) []Dir {
	treeDirs := make([]Dir, 0)
	for _, v := range dirs {
		if v.Pre == root {
			subDir := genTreeDirs(v.Id, dirs)
			dir := Dir{
				Id:     v.Id,
				Name:   v.Name,
				Pre:    v.Pre,
				SubDir: subDir,
			}
			fmt.Println(dir)
			treeDirs = append(treeDirs, dir)
		}
	}
	return treeDirs
}

//DELETE /v1/dirs/<Id>
func (s *Service) DeleteDirs_(args *cmdArgs, env *rpcutil.Env) (err error) {
	id := args.CmdArgs[0]
	if err = db.DoDelete(s.DirColl, map[string]string{"id": id}); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("%s is not exist", id))
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	if err = db.DoDelete(s.ReportColl, map[string]string{"dirId": id}); err != nil {
		if err == mgo.ErrNotFound {
			log.Warnf("no report in dir[%v] ", id, err)
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to delete dir: %v", id)
	return
}

/*
POST /v1/codes
Content-Type: application/json
{
    "name" : <Name>,
    "code" : <Code>,
	"datasetId" : <DatasetId>,
    "type" : <Type>,
}
*/

func (s *Service) PostCodes(env *rpcutil.Env) (ret common.Code, err error) {
	var data []byte
	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req common.Code
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostCode(err)
		return
	}
	var b bool
	if b, err = db.IsExist(s.DataSourceColl, M{"id": req.DatasetId}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	if !b {
		err = ErrorPostCode(fmt.Errorf("datasource %s is not exist", req.DatasetId))
		return
	}
	if req.Id, err = common.GenId(); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	req.Id = fmt.Sprintf("code_%s", req.Id)
	req.Type = strings.ToUpper(req.Type)
	req.CreateTime = common.GetCurrTime()

	if err = db.DoInsert(s.CodeColl, req); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	ret = req
	log.Infof("success to insert code: %+v", req)
	return
}

/*
GET /v1/codes?type=<DbType>&datasetId=<DatasetId>
200 ok
{
    codes: [
    {
        "id" : <Id>,
        "name" : <Name>,
        "type" : <Type>,
        "code" : <Code>,
        "datasetId" : <DatasetId>,
        "createTime" : <CreateTime>
    },
    ...
    ]
}
*/
type RetCodes struct {
	Codes []common.Code `json:"codes"`
}

func (s *Service) GetCodes(env *rpcutil.Env) (ret RetCodes, err error) {
	_dbType := env.Req.FormValue("type")
	_datasetId := env.Req.FormValue("datasetId")
	ds := make([]common.Code, 0)
	query := M{}
	if strings.TrimSpace(_dbType) != "" {
		query["type"] = _dbType
	}
	if strings.TrimSpace(_datasetId) != "" {
		query["datasetId"] = _datasetId
	}

	if err = s.CodeColl.Find(query).Sort("-createTime").All(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the code is empty !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	ret = RetCodes{ds}
	log.Infof("success to get all codes: %v", ret)
	return
}

/*
GET /v1/codes/codeId
200 ok
{
	"id" : <Id>,
	"name" : <Name>,
	"type" : <Type>,
	"code" : <Code>,
	"datasetId" : <DatasetId>,
	"createTime" : <CreateTime>
}
*/

func (s *Service) GetCodes_(args *cmdArgs, env *rpcutil.Env) (ret common.Code, err error) {
	id := args.CmdArgs[0]
	ret = common.Code{}
	if err = s.CodeColl.Find(M{"id": id}).One(&ret); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the code is not found !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to get code: %v", ret)
	return
}

/*
PUT /v1/codes/<Id>
Content-Type: application/json
{
    "name" : <Name>,
    "code" : <Code>,
    "type" : <Type>,
    "dbName" : <DbName>
}
*/
func (s *Service) PutCodes_(args *cmdArgs, env *rpcutil.Env) (err error) {
	id := args.CmdArgs[0]
	var data []byte
	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}

	var req common.Code
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostCode(err)
		return
	}
	var b bool
	if b, err = db.IsExist(s.DataSourceColl, M{"id": req.DatasetId}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	if !b {
		err = ErrorPostCode(fmt.Errorf("dataset %s is not exist", req.DatasetId))
		return
	}
	req.Id = id
	req.Type = strings.ToUpper(req.Type)
	req.CreateTime = common.GetCurrTime()
	err = db.DoUpdate(s.CodeColl, M{"id": id}, req)
	if err != nil {
		if err == mgo.ErrNotFound {
			err = ErrorPostCode(fmt.Errorf("update failed: code %s not exist", id))
			return
		}
		err = errors.Info(ErrInternalError, err)
		return
	}
	log.Infof("success to update code: %v", req)
	return
}

//DELETE /v1/codes/<Id>
func (s *Service) DeleteCodes_(args *cmdArgs, env *rpcutil.Env) (err error) {
	id := args.CmdArgs[0]
	if err = db.DoDelete(s.CodeColl, map[string]string{"id": id}); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("%s is not exist", id))
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to delete code: %v", id)
	return
}

/*
POST /v1/reports
Content-Type: application/json
{
	"dirId": <DirId>,
    "name" : <Name>
}
*/

func (s *Service) PostReports(env *rpcutil.Env) (ret common.Report, err error) {
	var data []byte
	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req common.Report
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostReport(err)
		return
	}
	var b bool
	if b, err = db.IsExist(s.ReportColl, M{"name": req.Name, "dirId": req.DirId}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	if b {
		err = ErrorPostReport(fmt.Errorf("the report name '%s' is already exist", req.Name))
		return
	}

	if req.Id, err = common.GenId(); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	req.Id = fmt.Sprintf("report_%s", req.Id)
	req.CreateTime = common.GetCurrTime()

	if err = db.DoInsert(s.ReportColl, req); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	layout := common.Layout{
		ReportId: req.Id,
		Layouts:  []map[string]interface{}{},
	}
	if err = db.DoInsert(s.LayoutColl, layout); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}

	ret = req
	log.Infof("success to insert report: %+v", req)
	return
}

/*
PUT /v1/reports/<reportId>
Content-Type: application/json
{
    "dirId": <DirId>,
    "name" : <Name>
}
注意：上面参数至少一个
*/

func (s *Service) PutReports_(args *cmdArgs, env *rpcutil.Env) (err error) {
	id := args.CmdArgs[0]
	var data []byte
	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req common.Report
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostReport(err)
		return
	}

	updateDoc := M{}

	if req.DirId != "" {
		var b bool
		if b, err = db.IsExist(s.DirColl, M{"id": req.DirId}); err != nil {
			err = errors.Info(ErrInternalError, err)
			return
		}
		if !b {
			err = ErrorPostReport(fmt.Errorf("the dirId '%s' is not exist", req.DirId))
			return
		}
		updateDoc["dirId"] = req.DirId
	}
	if req.Name != "" {
		updateDoc["name"] = req.Name
	}

	if len(updateDoc) == 0 {
		err = ErrorPostReport(fmt.Errorf("at least one parameter when update the report, but get  ", req))
		return
	}

	updateDoc["createTime"] = common.GetCurrTime()

	if err = db.DoUpdate(s.ReportColl, M{"id": id}, M{"$set": updateDoc}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	log.Infof("success to update report %s: %+v", id, updateDoc)
	return
}

/*
GET /v1/reports?dirId=<DirId>
200 OK
Content-Type: application/json
{
    "reports": [
    {
        "id" : <Id>,
        "name" : <Name>,
        "createTime" : <CreateTime>
    },
    ...
    ]
}
*/
type RetReports struct {
	Reports []common.Report `json:"reports"`
}

func (s *Service) GetReports(env *rpcutil.Env) (ret RetReports, err error) {
	id := env.Req.FormValue("dirId")
	query := M{}
	if strings.Trim(id, " ") != "" {
		query = M{"dirId": id}
	}
	ds := make([]common.Report, 0)
	if err = s.ReportColl.Find(query).Sort("-createTime").All(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the reports is enpty !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	ret = RetReports{ds}
	log.Infof("success to get all reports: %v", ret)
	return
}

//GET /v1/reports/<ReportId>
func (s *Service) GetReports_(args *cmdArgs, env *rpcutil.Env) (ret common.Report, err error) {
	id := args.CmdArgs[0]
	if err = s.ReportColl.Find(M{"id": id}).One(&ret); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the report is not exist !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to get all reports: %v", ret)
	return
}

//DELETE /v1/reports/<Id>
func (s *Service) DeleteReports_(args *cmdArgs, env *rpcutil.Env) (err error) {
	id := args.CmdArgs[0]
	if err = db.DoDelete(s.ReportColl, M{"id": id}); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("%s is not exist", id))
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	if err = db.DoDelete(s.LayoutColl, M{"reportId": id}); err != nil {
		log.Warnf("layout info of report %s is not exist, err:%v", id, err)
	}
	log.Infof("success to delete report: %v", id)
	return
}

/*
POST /v1/reports/<ReportId>/charts/<ChartId>
Content-Type: application/json
{
    "title" <Title>,
    "subTitle" : <SubTitle>,
    "type" : <Type>,
    "stack" : <True|False>,
    "codeId" : <CodeId>
}
*/

func (s *Service) PostReports_Charts_(args *cmdArgs, env *rpcutil.Env) (err error) {
	reportId := args.CmdArgs[0]
	chartId := args.CmdArgs[1]
	var f bool
	if f, err = db.IsExist(s.ReportColl, M{"id": reportId}); err != nil {
		return errors.Info(ErrInternalError, err)
	}
	if !f {
		return ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("report %s not exist", reportId))
	}

	var data []byte
	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req common.Chart
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostChart(err)
		return
	}
	req.Id = chartId
	req.Type = strings.ToUpper(req.Type)
	req.ReportId = reportId

	if f, err = db.IsExist(s.CodeColl, M{"id": req.CodeId}); err != nil {
		return errors.Info(ErrInternalError, err)
	}
	if !f {
		return ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("code %s not exist", req.CodeId))
	}

	if err = db.DoInsert(s.ChartColl, req); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	log.Infof("success to insert chart: %+v", req)
	return
}

/*
GET /v1/reports/<ReportId>/charts
200 OK
Content-Type: application/json
{
    "charts": [
    {
        "id" : <Id>,
        "title" <Title>,
        "subTitle" : <SubTitle>,
        "type" : <Type>,
        "stack" : <True|False>,
        "codeId" : <CodeId>
		"reportId" : <ReportId>
    },
    ...
    ]
}

*/
type RetCharts struct {
	Charts []common.Chart `json:"charts"`
}

func (s *Service) GetReports_Charts(args *cmdArgs, env *rpcutil.Env) (ret RetCharts, err error) {
	reportId := args.CmdArgs[0]
	var f bool
	if f, err = db.IsExist(s.ReportColl, M{"id": reportId}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	if !f {
		err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("report %s not exist", reportId))
		return
	}
	ds := make([]common.Chart, 0)
	if err = s.ChartColl.Find(M{"reportId": reportId}).All(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the report is enpty !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	ret = RetCharts{ds}
	log.Infof("success to get all charts in report %v: %s", ret, reportId)
	return
}

/*
GET /v1/reports/<ReportId>/charts/<ChartId>
{
    "title" <Title>,
    "subTitle" : <SubTitle>,
    "type" : <Type>,
    "stack" : <True|False>,
    "codeId" : <CodeId>,
    "code" : <Code>
}
*/
type RetChart struct {
	Type     string `json:"type"`
	Title    string `json:"title"`
	SubTitle string `json:"subTitle"`
	Stack    bool   `json:"stack"`
	CodeId   string `json:"codeId"`
	Code     string `json:"code"`
}

func (s *Service) GetReports_Charts_(args *cmdArgs, env *rpcutil.Env) (ret RetChart, err error) {
	reportId := args.CmdArgs[0]
	chartId := args.CmdArgs[1]
	var f bool
	if f, err = db.IsExist(s.ReportColl, M{"id": reportId}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	if !f {
		err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("report %s not exist", reportId))
		return
	}
	var ds common.Chart
	if err = s.ChartColl.Find(M{"reportId": reportId, "id": chartId}).One(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the charts not exist !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	var cs common.Code
	if err = s.CodeColl.Find(M{"id": ds.CodeId}).One(&cs); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the code not exist !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}

	ret = RetChart{
		Title:    ds.Title,
		Type:     ds.Type,
		SubTitle: ds.SubTitle,
		Stack:    ds.Stack,
		CodeId:   ds.CodeId,
		Code:     cs.Code,
	}
	log.Infof("success to get chart %v in report %s", ret, reportId)
	return
}

/*
DELETE /v1/reports/<ReportId>/charts/<ChartId>
*/
func (s *Service) DeleteReports_Charts_(args *cmdArgs, env *rpcutil.Env) (err error) {
	reportId := args.CmdArgs[0]
	chartId := args.CmdArgs[1]
	var f bool
	if f, err = db.IsExist(s.ReportColl, M{"id": reportId}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	if !f {
		err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("report %s not exist", reportId))
		return
	}
	if err = db.DoDelete(s.ChartColl, M{"id": chartId, "reportId": reportId}); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("%s is not exist", chartId))
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to delete chart %s in report %s", chartId, reportId)
	return
}

/*
POST /v1/layouts/<layoutId>
Content-Type: application/json
{
    "layouts" : [
        {
            "chartId" : <ChartId>,
            "data" : <Map>
        }
    ]
}
*/
func (s *Service) PostLayouts_(args *cmdArgs, env *rpcutil.Env) (err error) {
	reportId := args.CmdArgs[0]
	var f bool
	if f, err = db.IsExist(s.ReportColl, M{"id": reportId}); err != nil {
		return errors.Info(ErrInternalError, err)
	}
	if !f {
		return ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("report %s not exist", reportId))
	}
	var data []byte
	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req common.Layout
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostLayout(err)
		return
	}
	req.ReportId = reportId
	if err = db.DoUpsert(s.LayoutColl, M{"reportId": reportId}, req); err != nil {
		err = ErrorPostLayout(err)
		return
	}
	log.Infof("success to save layout info of report %s", reportId)
	return
}

/*
GET /v1/layouts/<LayoutId>
{
    "reportId" : <layoutId>,
    "layouts" : [
        {
            "chartId" : <ChartId>,
            "data" : <Map>
        }
    ]
}
*/
func (s *Service) GetLayouts_(args *cmdArgs, env *rpcutil.Env) (ret common.Layout, err error) {
	reportId := args.CmdArgs[0]
	var f bool
	if f, err = db.IsExist(s.ReportColl, M{"id": reportId}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	if !f {
		err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("report %s not exist", reportId))
		return
	}
	ret = common.Layout{}
	if err = s.LayoutColl.Find(M{"reportId": reportId}).One(&ret); err != nil {
		err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("report %s's layout info is not exist", reportId))
		return
	}
	log.Infof("success to get layout info of report %s", reportId)
	return
}

/*
GET /v1/datas?q=<CodeId>&type=<ChartType>
返回包

200 OK
Content-Type: application/json
{
    "type" : "ChartType",
    "tags": [
        ...        //tags值
    ],
    "datas": [
        1250548464
        ...
    ]
}
或者

{
    "type" : "ChartType",
    "tags":[
        ...
    ],
    "times":[
        1430061839000,
        ...
    ],
    "datas":[
        [123,...]
        ...
    ]
}
*/

func (s *Service) GetDatas(env *rpcutil.Env) (ret interface{}, err error) {
	_id := env.Req.FormValue("q")
	_code := env.Req.FormValue("code")
	_chartType := strings.ToUpper(env.Req.FormValue("type"))
	if _chartType == "" {
		_chartType = data.CHART_TABLE
	}
	log.Infof("query params :q=%s,code=%s,type=%s", _id, _code, _chartType)
	datasetId := _id
	if strings.HasPrefix(_id, "code_") {
		var cd common.Code
		if err = s.CodeColl.Find(M{"id": _id}).One(&cd); err != nil {
			if err == mgo.ErrNotFound {
				err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("the code %s is not exist !", _id))
				return
			}
			err = errors.Info(ErrInternalError, err)
		}
		datasetId = cd.DatasetId
		_code = cd.Code
	}
	var ds common.DataSource
	if err = s.DataSourceColl.Find(M{"id": datasetId}).One(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("the dataset is not exist !", datasetId))
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	if ret, err = data.Query(ds, _code, _chartType); err != nil {
		err = ErrQueryDatas(err, fmt.Sprintf("execute code %v failed", _code))
		return
	}
	log.Infof("success to query data of code %s", _id)
	return
}
