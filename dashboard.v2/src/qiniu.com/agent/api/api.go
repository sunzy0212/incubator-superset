package api

import (
	"fmt"

	"github.com/martini-contrib/render"
	"qiniupkg.com/kirk/kirksdk"
	"qiniupkg.com/x/log.v7"
)

type Conf struct {
	USER_ACCOUNT_AK string
	USER_ACCOUNT_SK string
	USER_APP_URI    string
}

type Context struct {
	Conf
	Delpoyed      bool
	accountClient kirksdk.AccountClient
	qcosClient    kirksdk.QcosClient
	Status        map[string]kirksdk.ServiceInfo
}
type Result struct {
	Status  string
	Message string
}

const (
	STACK_NAME          = "report"
	SERVICE_REPORT_NAME = "report-server"
	SERVICE_MONGO_NAME  = "mongodb"
)

const (
	RET_SUCCESS = "success"
	RET_ERROR   = "error"
)

const (
	PUBLIC_IP   = "PUBLIC_IP"
	DOMAIN      = "DOMAIN"
	INTERNAL_IP = "INTERNAL_IP"
)

var (
	STATUS_DEPLOYING = "deploying"
	STATUS_RUNNING   = "running"
	STATUS_STOP      = "stoped"
)

func New(cfg Conf) (*Context, error) {
	config := kirksdk.AccountConfig{
		AccessKey: cfg.USER_ACCOUNT_AK,
		SecretKey: cfg.USER_ACCOUNT_SK,
		Host:      kirksdk.DefaultAccountHost,
	}
	accountClient := kirksdk.NewAccountClient(config)
	client, err := accountClient.GetQcosClient(nil, cfg.USER_APP_URI)
	if err != nil {
		return nil, err
	}

	deployed := false
	_, err = client.GetStack(nil, STACK_NAME)
	if err != nil {
		//not exsit than create stack
		log.Error(err)
		deployed = false
		err = nil
	} else {
		deployed = true
	}
	ret := &Context{
		Conf:          cfg,
		Delpoyed:      deployed,
		accountClient: accountClient,
		qcosClient:    client,
		Status: map[string]kirksdk.ServiceInfo{
			"mongo":  kirksdk.ServiceInfo{},
			"report": kirksdk.ServiceInfo{},
		},
	}

	return ret, nil
}

func (c *Context) IsDeployed(r render.Render) {
	r.JSON(200, map[string]bool{"result": c.Delpoyed})
}

func (c *Context) Allocate(r render.Render) {
	_, err := c.qcosClient.GetStack(nil, STACK_NAME)
	if err != nil {
		//not exsit than create stack
		err = c.qcosClient.CreateStack(nil, kirksdk.CreateStackArgs{Name: STACK_NAME})
		if err != nil {
			log.Error("Failed to create stack ~ ", err)
			return
		}
	}

	mongoHost, err := c.allocateMongoIfNotExist()
	if err != nil {
		log.Error(err)
		r.JSON(400, Result{Status: RET_ERROR, Message: fmt.Sprintf("%v", err)})
		return
	}

	default_report_quota := "4U8G"

	config := kirksdk.CreateServiceArgs{
		InstanceNum: 1,
		Name:        SERVICE_REPORT_NAME,
		Spec: kirksdk.ServiceSpec{
			AutoRestart: "always",
			Image:       "report-app/report2:latest",
			UnitType:    default_report_quota,
			Envs: []string{
				fmt.Sprintf("QINIU_ACCESS_KEY=%s", c.USER_ACCOUNT_AK),
				fmt.Sprintf("QINIU_SECRET_KEY=%s", c.USER_ACCOUNT_SK),
				fmt.Sprintf("MONGO_HOST=%s", mongoHost),
				fmt.Sprintf("MONGO_DB=%s", "reportdb"),
				fmt.Sprintf("DRILL_HOST=%s", "http://192.168.64.48:8047"),
				fmt.Sprintf("REPORT_WEB_HOST=%s", "")},
		},
		Stateful: true,
	}

	_, err = c.qcosClient.GetServiceInspect(nil, STACK_NAME, SERVICE_REPORT_NAME)
	if err != nil {
		log.Warn(err)
		//not exsit than create service
		err = c.qcosClient.CreateService(nil, STACK_NAME, config)
		if err != nil {
			log.Error(err)
			r.JSON(400, Result{Status: RET_ERROR, Message: fmt.Sprintf("%v", err)})
			return
		}
	}

	err = c.createAP()
	if err != nil {
		log.Warn(err)
		r.JSON(400, Result{Status: RET_ERROR, Message: fmt.Sprintf("%v", err)})
		return
	}
	c.Delpoyed = true
	r.JSON(200, Result{Status: RET_SUCCESS, Message: "inited report server"})
}

func (c *Context) UpdateReport(r render.Render) {
	_, err := c.qcosClient.GetServiceInspect(nil, STACK_NAME, SERVICE_REPORT_NAME)
	if err != nil {
		log.Error(err)
		r.JSON(400, Result{Status: RET_ERROR, Message: fmt.Sprintf("%v", err)})
		return
	}
	updateConfig := kirksdk.UpdateServiceArgs{
		ManualUpdate: false,
	}
	err = c.qcosClient.UpdateService(nil, STACK_NAME, SERVICE_REPORT_NAME, updateConfig)
	if err != nil {
		log.Error(err)
		r.JSON(400, Result{Status: RET_ERROR, Message: fmt.Sprintf("%v", err)})
		return
	}
	r.JSON(200, Result{Status: RET_SUCCESS})
	return
}

func (c *Context) createAP() (err error) {
	apConfig := kirksdk.CreateApArgs{
		Type:      PUBLIC_IP,
		Provider:  "Telecom",
		Bandwidth: 10,
		UnitType:  "BW_10M",
		Title:     "Report address",
	}
	ap, err := c.qcosClient.CreateAp(nil, apConfig)
	if err != nil {
		log.Error(err)
		return
	}

	portSetting := kirksdk.SetApPortArgs{
		Proto:       "TCP",
		BackendPort: 8000,
		Backends: []kirksdk.ApBackendArgs{
			kirksdk.ApBackendArgs{
				Stack:   STACK_NAME,
				Service: SERVICE_REPORT_NAME,
			},
		},
	}

	err = c.qcosClient.SetApPort(nil, ap.ApID, "443", portSetting)
	if err != nil {
		log.Error(err)
		return
	}
	return
}

func (c *Context) allocateMongoIfNotExist() (host string, err error) {
	default_mongo_quota := "1U8G"

	config := kirksdk.CreateServiceArgs{
		InstanceNum: 1,
		Name:        "mongodb",
		Spec: kirksdk.ServiceSpec{
			AutoRestart: "always",
			Command:     []string{"mongod"},
			Image:       "report-app/mongo:latest",
			UnitType:    default_mongo_quota,
			Envs:        []string{},
		},
		Stateful: true,
		Volumes: []kirksdk.VolumeSpec{
			kirksdk.VolumeSpec{
				Name:      "mongodisk",
				FsType:    "ext4",
				UnitType:  "SATA_10G",
				MountPath: "/data/db",
			},
		},
	}

	ret, err := c.qcosClient.GetServiceInspect(nil, STACK_NAME, config.Name)
	if err != nil {
		log.Warnf("%s is not exist ,try to create it", config.Name)
		err = c.qcosClient.CreateService(nil, STACK_NAME, config)
		if err != nil {
			log.Error(err)
			return
		}
		return fmt.Sprintf("%s.%s", config.Name, STACK_NAME), nil
	}

	return ret.ContainerIPs[0], nil
}

type Status struct {
	Status  string
	Type    string
	Message string
}

func (c *Context) GetInspects(r render.Render) {
	c.inpsects()
	r.JSON(200, c.Status)
}

func (c *Context) IsDeleted(r render.Render) {
	isDeleted := false
	_, err := c.qcosClient.GetStack(nil, STACK_NAME)
	if err != nil {
		//not exsit than create stack
		isDeleted = true
	}
	r.JSON(200, map[string]bool{"isDeleted": isDeleted})
}

func (c *Context) inpsects() {

	log.Info("try to get inspect of services")
	ret, err := c.qcosClient.GetServiceInspect(nil, STACK_NAME, SERVICE_MONGO_NAME)
	if err != nil {
		log.Error(err)
	}
	c.Status["mongo"] = ret

	ret, err = c.qcosClient.GetServiceInspect(nil, STACK_NAME, SERVICE_REPORT_NAME)
	if err != nil {
		log.Error(err)
	}
	c.Status["report"] = ret

}
