package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-martini/martini"
	"github.com/martini-contrib/render"
	"qiniupkg.com/x/log.v7"
)

type User struct {
	Username   string `json:"username" bson:"username"`
	Password   string `json:"password" bson:"password"`
	CreateTime string `json:"createTime" bson:"createTime"`
	LoginTime  string `json:"loginTime" bson:"loginTime"`
}

var (
	//webRoot          = "https://61.153.154.143/v1"
	webRoot          = "https://report-server.report:8000/v1"
	REPORT_USERS_API = fmt.Sprintf("%s/users", webRoot)
)

type UserList struct {
	Users []User `json:"users" bson:"users"`
}

func (c *Context) GetUsersList(r render.Render) {
	var users UserList
	err := c.UserClient.GetCall(nil, &users, REPORT_USERS_API)
	if err != nil {
		r.JSON(400, err)
		log.Error(err)
		return
	}
	log.Infof("success to get user list")
	r.JSON(200, users)
}

func (c *Context) AddUser(user User, r render.Render) {
	var res User
	err := c.UserClient.CallWithJson(nil, &res, REPORT_USERS_API, user)
	if err != nil {
		r.JSON(200, err)
		log.Error(err)
		return
	}
	r.JSON(200, res)
}

func (c *Context) UpdateUser(args martini.Params, user User, r render.Render) {
	username := args["username"]
	url := fmt.Sprintf("%s/%s", REPORT_USERS_API, username)
	bodyBytes, err := json.Marshal(user)
	if err != nil {
		log.Error(err, user)
		r.JSON(400, err)
		return
	}
	req, err := http.NewRequest("PUT", url, bytes.NewReader(bodyBytes))
	if err != nil {
		log.Error(err)
		r.JSON(400, err)
		return
	}
	res, err := c.UserClient.Do(nil, req)
	if err != nil {
		log.Error(err, url)
		r.JSON(400, err)
		return
	}
	defer res.Body.Close()
	r.JSON(200, map[string]string{})
}

func (c *Context) DeleteUser(args martini.Params, r render.Render) {
	username := args["username"]
	url := fmt.Sprintf("%s/%s", REPORT_USERS_API, username)
	res, err := c.UserClient.Delete(nil, url)
	if err != nil {
		log.Error(err, url)
		r.JSON(400, err)
		return
	}
	defer res.Body.Close()
	r.JSON(200, map[string]string{})
}
