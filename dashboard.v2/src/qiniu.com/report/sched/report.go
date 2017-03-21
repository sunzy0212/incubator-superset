package sched

import (
	"fmt"
	"log"
	"time"

	"github.com/qiniu/rpc.v1"
)

type Report struct {
	name string
	spec string
}

type ReportConfig struct {
	Name string `json:"name"`
}

func NewReport(spec string, cfg ReportConfig) *Report {
	return &Report{name: cfg.Name, spec: spec}
}

func (r *Report) Spec() string {
	return r.spec
}
func (r *Report) Name() string {
	return r.name
}
func (r *Report) Type() string {
	return "REPORT"
}

func (r *Report) Run() {
	//新建目录
	//
	//新建报表
	//
	log.Println(fmt.Sprintf("执行`%s`: spec{%s}\ttype:%s", r.Name(), r.Spec(), r.Type()))
}

func (r Report) getRpcClient() rpc.Client {
	return rpc.NewClientTimeout(time.Duration(10*time.Second), time.Duration(10*time.Second))
}
