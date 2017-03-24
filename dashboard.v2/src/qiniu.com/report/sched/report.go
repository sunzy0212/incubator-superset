package sched

import (
	"fmt"
	"log"
	"time"

	"github.com/qiniu/rpc.v1"
	"qiniu.com/report/common"
)

type ReportSender struct {
	common.Reporter
	spec string
}

type ReportConfig struct {
	Name string `json:"name"`
}

func NewReportSender(spec string, cfg common.Reporter) *ReportSender {
	return &ReportSender{Reporter: cfg, spec: spec}
}

func (r *ReportSender) Spec() string {
	return r.spec
}
func (r *ReportSender) Name() string {
	return r.Name()
}
func (r *ReportSender) Type() string {
	return "REPORT"
}

func (r *ReportSender) Run() {
	//新建目录
	//
	//新建报表
	//
	log.Println(fmt.Sprintf("执行`%s`: spec{%s}\ttype:%s", r.Name(), r.Spec(), r.Type()))
}

func (r ReportSender) getRpcClient() rpc.Client {
	return rpc.NewClientTimeout(time.Duration(10*time.Second), time.Duration(10*time.Second))
}
