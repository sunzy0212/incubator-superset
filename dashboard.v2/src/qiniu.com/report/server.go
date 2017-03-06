package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"regexp"
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
	"qiniu.com/report/rest"
)

type M map[string]interface{}

const (
	DATASOURCE_NAME_PATTERN = "^[a-zA-Z_][a-zA-Z0-9_]{0,8}$"
)

var (
	DirTypes            = []string{"REPORT", "CHART"}
	ChartComponentTypes = []string{"TEXT", "CHART"}
)

type cmdArgs struct {
	CmdArgs []string
}

type Service struct {
	common.Collections
	RWMux             *sync.RWMutex
	client            *rest.DrillClient
	dataSourceManager *data.DataSourceManager
	executor          *data.Executor
}

func NewService(coll common.Collections, restUrls []string) (s *Service, err error) {
	s = &Service{
		Collections:       coll,
		RWMux:             &sync.RWMutex{},
		client:            rest.NewDrillClient(restUrls),
		dataSourceManager: data.NewDataSourceManager(),
		executor:          data.NewExecutor(),
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

	valid, err := regexp.MatchString(DATASOURCE_NAME_PATTERN, req.Name)
	if err != nil {
		err = errors.Info(ErrInternalError, MATCH_PATTERN_FAILED_MESSAGE).Detail(err)
		return
	}
	if !valid {
		err = ErrorPostDataSource(errors.New(ErrInvalidDataSourceName))
		return
	}

	if req.Id, err = common.GenId(); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	req.Id = fmt.Sprintf("datasource_%s", req.Id)
	req.CreateTime = common.GetCurrTime()
	req.Type = strings.ToUpper(req.Type)

	storage := s.dataSourceManager.Get(req).GenStorage()
	res, err1 := s.client.PostStorage(storage)
	if err1 != nil {
		err = errors.Info(ErrInternalError).Detail(err1)
		return
	}
	if res.Result != "success" {
		err = ErrorPostDataSource(fmt.Errorf("failed to register datasource , err ~ %v", res.Result))
		return
	}

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

	valid, err := regexp.MatchString(DATASOURCE_NAME_PATTERN, req.Name)
	if err != nil {
		err = errors.Info(ErrInternalError, MATCH_PATTERN_FAILED_MESSAGE).Detail(err)
		return
	}
	if !valid {
		err = ErrorPostDataSource(errors.New(ErrInvalidDataSourceName))
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

	valid, err := regexp.MatchString(DATASOURCE_NAME_PATTERN, req.Name)
	if err != nil {
		err = errors.Info(ErrInternalError, MATCH_PATTERN_FAILED_MESSAGE).Detail(err)
		return
	}
	if !valid {
		err = ErrorPostDataSource(errors.New(ErrInvalidDataSourceName))
		return
	}

	req.Id = id
	req.Type = strings.ToUpper(req.Type)
	req.CreateTime = common.GetCurrTime()

	storage := s.dataSourceManager.Get(req).GenStorage()
	res, err1 := s.client.PostStorage(storage)
	if err1 != nil {
		err = errors.Info(ErrInternalError).Detail(err1)
		return
	}
	if res.Result != "success" {
		err = ErrorPostDataSource(fmt.Errorf("failed to register datasource , err ~ %v", res.Result))
		return
	}

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

/*GET /v1/datasets/<Id>
 */

func (s *Service) GetDatasets_(args *cmdArgs, env *rpcutil.Env) (ret common.DataSet, err error) {
	id := args.CmdArgs[0]
	ret = common.DataSet{}
	if err = s.DataSetColl.Find(M{"id": id}).One(&ret); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the dataset is not exsit !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to get dataset: %v", ret)
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

func (s *Service) isDirTypeMatch(dirType string) bool {
	var flag = false
	for _, v := range DirTypes {
		if v == strings.ToUpper(dirType) {
			flag = true
			break
		}
	}
	return flag
}

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
	req.Type = strings.ToUpper(req.Type)
	if flag := s.isDirTypeMatch(req.Type); !flag {
		err = ErrorPostDir(fmt.Errorf("dir `type` is need, the type maybe `report|REPORT|chart|CHAHRT`"))
		return
	}

	if req.Pre == "" || !strings.HasPrefix(req.Pre, "dir_") {
		req.Pre = "ROOT"
	}
	var b bool
	if b, err = db.IsExist(s.DirColl, M{"name": req.Name, "type": req.Type, "pre": req.Pre}); err != nil {
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
	req.Type = strings.ToUpper(req.Type)
	if flag := s.isDirTypeMatch(req.Type); !flag {
		err = ErrorPostDir(fmt.Errorf("dir `type` is need, the type maybe `report|REPORT|chart|CHAHRT`"))
		return
	}

	if req.Pre == "" || !strings.HasPrefix(req.Pre, "dir_") {
		req.Pre = "ROOT"
	}
	var b bool
	if b, err = db.IsExist(s.DirColl,
		M{"name": req.Name, "pre": req.Pre, "type": req.Type, "id": M{"$ne": id}}); err != nil {
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

/*GET /v1/dirs?type=<report|REPORT|chart|CHAHRT>
 */

type Dir struct {
	Id     string `json:"id" bson:"id"`
	Type   string `json:"type" bson:"type"`
	Name   string `json:"name" bson:"name"`
	Pre    string `json:"pre" bson:"pre"`
	SubDir []Dir  `json:"subDir" bson:"subDir"`
}
type TreeDirs struct {
	Dirs []Dir `json:"dirs"`
}

func (s *Service) GetDirs(env *rpcutil.Env) (ret TreeDirs, err error) {
	_dirType := strings.ToUpper(env.Req.FormValue("type"))
	if flag := s.isDirTypeMatch(_dirType); !flag {
		err = fmt.Errorf("the args dir `type` is need, but get null, the uri maybe `.../dirs?type=<report|REPORT|chart|CHAHRT>`")
		return
	}
	ds := make([]common.Dir, 0)
	if err = s.DirColl.Find(M{"type": _dirType}).All(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the dir is empty !")
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
				Type:   v.Type,
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

func (s *Service) deleteDir(id string) (err error) {
	var dir common.Dir
	if err = s.DirColl.Find(M{"id": id}).One(&dir); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("%s is not exist", id))
			return
		}
		log.Error(err)
		err = errors.Info(ErrInternalError, err)
		return
	}
	switch dir.Type {
	case "REPORT":
		if err = db.DoDeleteAll(s.ReportColl, M{"dirId": id}, true); err != nil {
			log.Errorf("fail to delete cascade charts under dir %s, err ~ %v", id, err)
		}
	case "CHART":
		if err = db.DoDeleteAll(s.ChartColl, M{"dirId": id}, true); err != nil {
			log.Errorf("fail to delete cascade charts under dir %s, err ~ %v", id, err)
		}
	default:
		return
	}
	var dirs []common.Dir
	if err = s.DirColl.Find(M{"pre": id}).All(&dirs); err != nil {
		log.Error(err)
		return
	}
	if len(dirs) > 0 {
		log.Infof("try to delete subDir:%#v", dir)
		for _, dir := range dirs {
			s.deleteDir(dir.Id)
		}
	}
	if err = db.DoDelete(s.DirColl, M{"id": id}); err != nil {
		log.Error()
	}
	return nil
}

//DELETE /v1/dirs/<Id>
func (s *Service) DeleteDirs_(args *cmdArgs, env *rpcutil.Env) (err error) {
	id := args.CmdArgs[0]
	err = s.deleteDir(id)
	if err == nil {
		log.Infof("success to delete dir: %s", id)
	} else {
		log.Errorf("fail to delete dir: %s, err ~ %v", id, err)
	}
	return
}

/*
POST /v1/datasets/<DatasetId>/codes
Content-Type: application/json
{
	"name" : <Name>,
	"querys" : <Querys>
}
*/

func (s *Service) PostDatasets_Codes(args *cmdArgs, env *rpcutil.Env) (ret common.Code, err error) {
	datasetId := args.CmdArgs[0]
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
	if b, err = db.IsExist(s.DataSetColl, M{"id": datasetId}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	if !b {
		err = ErrorPostCode(fmt.Errorf("dataset %s is not exist", datasetId))
		return
	}
	if req.Id, err = common.GenId(); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	req.Id = fmt.Sprintf("code_%s", req.Id)
	req.DatasetId = datasetId
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
PUT /v1/datasets/<DatasetId>/codes/<Id>
Content-Type: application/json
{
    "name" : <Name>,
	"querys" : <Querys>
}
*/
func (s *Service) PutDatasets_Codes_(args *cmdArgs, env *rpcutil.Env) (err error) {
	datasetId := args.CmdArgs[0]
	codeId := args.CmdArgs[1]
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
	if b, err = db.IsExist(s.DataSetColl, M{"id": datasetId}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	if !b {
		err = ErrorPostCode(fmt.Errorf("dataset %s is not exist", datasetId))
		return
	}
	req.Id = codeId
	req.DatasetId = datasetId
	req.CreateTime = common.GetCurrTime()
	err = db.DoUpdate(s.CodeColl, M{"id": codeId, "datasetId": datasetId}, req)
	if err != nil {
		if err == mgo.ErrNotFound {
			err = ErrorPostCode(fmt.Errorf("update failed: code %s not exist under dataset %s", codeId, datasetId))
			return
		}
		err = errors.Info(ErrInternalError, err)
		return
	}
	log.Infof("success to update code: %v", req)
	return
}

/*
GET /v1/datasets/<DatasetId>/codes
200 ok
{
    codes: [
    {
	"id" : <Id>,
	"name" : <Name>,
	"querys" : <Querys>,
	"datasetId" : <DatasetId>,
	},
    ...
    ]
}
*/
type RetCodes struct {
	Codes []common.Code `json:"codes"`
}

func (s *Service) GetDatasets_Codes(args *cmdArgs, env *rpcutil.Env) (ret RetCodes, err error) {
	datasetId := args.CmdArgs[0]
	ds := make([]common.Code, 0)

	if err = s.CodeColl.Find(M{"datasetId": datasetId}).Sort("-createTime").All(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the code list is empty !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	ret = RetCodes{ds}
	log.Infof("success to get all codes: %v under dataset %s ", ret, datasetId)
	return
}

/*
GET /v1/datasets/<DatasetId>/codes/<Id>
200 ok
Content-Type: application/json
{
	"id" : <Id>,
	"name" : <Name>,
	"querys" : <Querys>,
	"datasetId" : <DatasetId>,
}
*/

func (s *Service) GetDatasets_Codes_(args *cmdArgs, env *rpcutil.Env) (ret common.Code, err error) {
	datasetId := args.CmdArgs[0]
	codeId := args.CmdArgs[1]
	ret = common.Code{}
	if err = s.CodeColl.Find(M{"datasetId": datasetId, "id": codeId}).One(&ret); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the code is not found !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to get code: %v", ret)
	return
}

// DELETE /v1/datasets/<DatasetId>/codes/<Id>
func (s *Service) DeleteDatasets_Codes_(args *cmdArgs, env *rpcutil.Env) (err error) {
	datasetId := args.CmdArgs[0]
	codeId := args.CmdArgs[1]
	if err = db.DoDelete(s.CodeColl, M{"id": codeId, "datasetId": datasetId}); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("code %s is not exist under dataset %s ", codeId, datasetId))
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to delete code[%v] under dataset[%s]", codeId, datasetId)
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
			err = ErrNONEXISTENT_MESSAGE(err, "the reports is empty !")
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

// #################################### Chart
/*
POST /v1/charts
Content-Type: application/json
{
	"title" <Title>,
	"subTitle" : <SubTitle>,
	"type" : <Type>,
	"stack" : <True|False>,
	"codeId" : <CodeId>,
	"dirId" : <DirId>
}
*/

func (s *Service) isChartComponentMatch(vType string) bool {
	var flag = false
	for _, v := range ChartComponentTypes {
		if v == strings.ToUpper(vType) {
			flag = true
			break
		}
	}
	return flag
}

func (s *Service) PostCharts(env *rpcutil.Env) (chart common.Chart, err error) {
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
	if req.Id, err = common.GenId(); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	req.Id = fmt.Sprintf("chart_%s", req.Id)

	req.Type = strings.ToUpper(req.Type)
	if flag := s.isChartComponentMatch(req.Type); !flag {
		err = ErrorPostChart(fmt.Errorf("chart component `type` is need, the type maybe `text|TEXT|chart|CHAHRT`"))
		return
	}

	var f bool
	if f, err = db.IsExist(s.CodeColl, M{"id": req.CodeId}); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	if !f {
		err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("code %s not exist", req.CodeId))
		return
	}

	if err = db.DoInsert(s.ChartColl, req); err != nil {
		err = ErrorPostChart(err)
		return
	}
	chart = req
	log.Infof("success to insert chart: %+v", req)
	return
}

/*
PUT /v1/charts/<ChartId>
Content-Type: application/json
{
	"title" <Title>,
	"subTitle" : <SubTitle>,
	"type" : <Type>,
	"stack" : <True|False>,
	"codeId" : <CodeId>,
	"dirId" : <DirId>
}
*/
func (s *Service) PutCharts_(args *cmdArgs, env *rpcutil.Env) (err error) {
	chartId := args.CmdArgs[0]
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
	if flag := s.isChartComponentMatch(req.Type); !flag {
		err = ErrorPostChart(fmt.Errorf("chart component `type` is need, the type maybe `text|TEXT|chart|CHAHRT`"))
		return
	}

	var f bool
	if f, err = db.IsExist(s.CodeColl, M{"id": req.CodeId}); err != nil {
		return errors.Info(ErrInternalError, err)
	}
	if !f {
		return ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("code %s not exist", req.CodeId))
	}

	if err = db.DoUpdate(s.ChartColl, M{"id": req.Id}, req); err != nil {
		err = ErrorPostChart(err)
		return
	}
	log.Infof("success to update chart: %+v", req)
	return
}

/*
GET /v1/charts?dirId=<DirId>
*/
type RetCharts struct {
	Charts []common.Chart `json:"charts"`
}

func (s *Service) GetCharts(env *rpcutil.Env) (ret RetCharts, err error) {
	dirId := env.Req.FormValue("dirId")
	ds := make([]common.Chart, 0)
	if err = s.ChartColl.Find(M{"dirId": dirId}).All(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the report is empty !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	ret = RetCharts{ds}
	log.Infof("success to get all charts in dirId %v: %s", ret, dirId)
	return
}

/*
GET /v1/charts/<ChartId>
Content-Type: application/json
{
    "title" <Title>,
    "subTitle" : <SubTitle>,
    "type" : <Type>,
    "stack" : <True|False>,
    "codeId" : <CodeId>,
	"dirId" : <DirId>
}
*/
func (s *Service) GetCharts_(args *cmdArgs, env *rpcutil.Env) (ret common.Chart, err error) {
	chartId := args.CmdArgs[0]
	if err = s.ChartColl.Find(M{"id": chartId}).One(&ret); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the charts not exist !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to get chart %v", ret)
	return
}

/*
DELETE /v1/charts/<ChartId>
*/
func (s *Service) DeleteCharts_(args *cmdArgs, env *rpcutil.Env) (err error) {
	chartId := args.CmdArgs[0]
	if err = db.DoDelete(s.ChartColl, M{"id": chartId}); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("%s is not exist", chartId))
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to delete chart %s", chartId)
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
POST /v1/datas?type=<DataType>
{
	"querys" : <Querys>,
}
*/
func (s *Service) PostDatas(env *rpcutil.Env) (ret interface{}, err error) {
	_dataType := strings.ToUpper(env.Req.FormValue("type"))
	dataType := common.JSON
	if _dataType != "" {
		dataType = common.ToDataFormatType(_dataType)
	}

	var _data []byte
	if _data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req common.Code
	if err = json.Unmarshal(_data, &req); err != nil {
		err = ErrQueryDatas(err, UNMARSHAL_JSON_FAILED_MESSAGE)
		return
	}
	return s.executor.Execute(data.QueryConfig{dataType, req})
}

/*
GET /v1/datas?q=<CodeId>&type=<DataType>
*/

func (s *Service) GetDatas(env *rpcutil.Env) (ret interface{}, err error) {
	_codeId := env.Req.FormValue("codeId")
	_dataType := strings.ToUpper(env.Req.FormValue("type"))
	dataType := common.JSON
	if _dataType != "" {
		dataType = common.ToDataFormatType(_dataType)
	}

	var req common.Code
	if err = s.CodeColl.Find(M{"id": _codeId}).One(&ret); err != nil {
		err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("codeId %s is not exist", _codeId))
		return
	}
	return s.executor.Execute(data.QueryConfig{dataType, req})
}
