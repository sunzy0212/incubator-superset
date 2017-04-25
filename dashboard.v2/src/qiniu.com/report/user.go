package main

import (
	"crypto/sha1"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/qiniu/errors"
	"gopkg.in/mgo.v2"

	"github.com/qiniu/http/rpcutil.v1"
	"qiniu.com/report/common"
	"qiniu.com/report/common/db"
	. "qiniu.com/report/common/errors"
	"qiniupkg.com/x/log.v7"
)

type User struct {
	Username   string `json:"username" bson:"username"`
	Password   string `json:"password" bson:"password"`
	CreateTime string `json:"createTime" bson:"createTime"`
	LoginTime  string `json:"loginTime" bson:"loginTime"`
}

/*
新增用户
POST /v1/users
*/

func (s *Service) PostUsers(env *rpcutil.Env) (ret User, err error) {
	var data []byte

	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req User
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostUser(err)
		return
	}
	var b = false
	if b, err = db.IsExist(s.UserColl, M{"username": req.Username}); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}

	if b {
		err = ErrorPostUser(fmt.Errorf("Username `%s` already exist", req.Username))
		return
	}
	req.Password = base64.StdEncoding.EncodeToString([]byte(req.Password))
	req.CreateTime = common.GetCurrTime()
	if err = db.DoInsert(s.UserColl, req); err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	ret = req
	log.Infof("success to add user")
	return
}

/*
修改用户密码
PUT /v1/users/<User>/<Username>
*/

func (s *Service) PutUsers_(args *cmdArgs, env *rpcutil.Env) (err error) {
	username := args.CmdArgs[0]
	var data []byte
	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req User
	if err = json.Unmarshal(data, &req); err != nil {
		err = ErrorPostUser(err)
		return
	}
	req.Username = username
	var b = false
	if b, err = db.IsExist(s.UserColl, M{"username": req.Username}); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}

	if !b {
		err = ErrorPostUser(fmt.Errorf("Username `%s` not exist", req.Username))
		return
	}

	req.Password = base64.StdEncoding.EncodeToString([]byte(req.Password))
	req.CreateTime = common.GetCurrTime()

	err = db.DoUpdate(s.UserColl, M{"username": username}, req)
	if err != nil {
		err = errors.Info(ErrInternalError, err)
		return
	}
	log.Infof("success to update user")
	return
}

type UserList struct {
	Users []User `json:"users" bson:"users"`
}

// Get /v1/users
func (s *Service) GetUsers(env *rpcutil.Env) (ret UserList, err error) {
	ds := make([]User, 0)
	if err = s.UserColl.Find(M{}).Sort("-loginTime").All(&ds); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, "the userlist is empty !")
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	ret = UserList{ds}
	log.Infof("success to get all users: %v", ret)
	return
}

//DELETE /v1/users/<Username>
func (s *Service) DeleteUsers_(args *cmdArgs, env *rpcutil.Env) (err error) {
	username := args.CmdArgs[0]
	if err = db.DoDelete(s.UserColl, M{"username": username}); err != nil {
		if err == mgo.ErrNotFound {
			err = ErrNONEXISTENT_MESSAGE(err, fmt.Sprintf("%s is not exist", username))
			return
		}
		err = errors.Info(ErrInternalError, err)
	}
	log.Infof("success to delete user: %v", username)
	return
}

/*
POST /v1/users/login
*/
type LoginResult struct {
	Status    string `json:"status"`
	SessionId string `json:"sessionId"`
}

func (s *Service) PostUsersLogin(env *rpcutil.Env) (ret LoginResult, err error) {
	var data []byte

	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var user User
	if err = json.Unmarshal(data, &user); err != nil {
		err = ErrorPostUser(err)
		return
	}

	var b = false
	if b, err = db.IsExist(s.UserColl, M{"username": user.Username, "password": user.Password}); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}

	if b {
		sessionId := GenSessionId(user)
		s.session.Set(sessionId, user)
		ret = LoginResult{
			Status:    "ok",
			SessionId: sessionId,
		}
	} else {
		ret = LoginResult{
			Status:    "error",
			SessionId: "",
		}
	}
	return
}

/*
POST /v1/users/logout
*/
type ReqLogout struct {
	SessionId string `json:"sessionId"`
}

func (s *Service) PostUsersLogout(env *rpcutil.Env) (err error) {
	var data []byte

	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req ReqLogout
	if err = json.Unmarshal(data, &req); err != nil {
		err = errors.Info(ErrInternalError, UNMARSHAL_JSON_FAILED_MESSAGE).Detail(err)
		return
	}
	s.session.Delete(req.SessionId)
	return
}

/*
POST /v1/users/check
*/
type CheckRet struct {
	Login bool        `json:"login"`
	Info  interface{} `json:"info"`
}

func (s *Service) PostUsersCheck(env *rpcutil.Env) (ret CheckRet, err error) {
	var data []byte

	if data, err = ioutil.ReadAll(env.Req.Body); err != nil {
		err = errors.Info(ErrInternalError, FETCH_REQUEST_ENTITY_FAILED_MESSAGE).Detail(err)
		return
	}
	var req ReqLogout
	if err = json.Unmarshal(data, &req); err != nil {
		err = errors.Info(ErrInternalError, UNMARSHAL_JSON_FAILED_MESSAGE).Detail(err)
		return
	}
	user, found := s.session.Get(req.SessionId)
	ret = CheckRet{
		Login: found,
		Info:  user,
	}
	return
}

func GenSessionId(u User) string {
	signString := fmt.Sprintf("%s:%s:%s", u.Password, u.Username, u.LoginTime)
	return getSha1Value(signString)
}

func getSha1Value(str string) string {
	h := sha1.New()
	h.Write([]byte(str))
	return fmt.Sprintf("%x", h.Sum(nil))
}
