package sched

import (
	"fmt"

	"time"

	"github.com/qiniu/rpc.v1"
	"qiniu.com/report/common"
	"qiniupkg.com/x/log.v7"
)

type ReportSender struct {
	common.Reporter
	spec string
}

func NewReportSender(spec string, cfg common.Reporter) *ReportSender {
	return &ReportSender{Reporter: cfg, spec: spec}
}

func (r *ReportSender) Spec() string {
	return r.spec
}
func (r *ReportSender) Name() string {
	return r.Reporter.Name
}
func (r *ReportSender) Type() string {
	return "REPORT"
}

func (r *ReportSender) Run() {
	url := "http://localhost:8000"
	client := r.getRpcClient()
	//新建报表
	dateFormatString := time.Now().Format("2006-01-02T1504")
	name := dateFormatString
	if len(r.Reporter.Rules) == 2 {
		name = fmt.Sprintf("%s-%s", r.Name(), dateFormatString)
	}

	req := common.Report{
		DirId: r.PreDirId,
		Name:  name,
		Args:  map[string]string{"date": time.Now().Format("2006-01-02")},
	}
	var res common.Report
	err := client.CallWithJson(nil, &res, url+"/v1/reports", req)
	if err != nil {
		log.Error(err)
		return
	}
	var layout common.Layout
	err = client.GetCall(nil, &layout, url+fmt.Sprintf("/v1/layouts/%s", r.ReportId))
	if err != nil {
		log.Error(err)
		return
	}
	layout.ReportId = req.Id
	err = client.CallWithJson(nil, nil, url+fmt.Sprintf("/v1/layouts/%s", res.Id), layout)
	if err != nil {
		log.Error(err)
		return
	}
	log.Println(fmt.Sprintf("generate report `%s`: spec{%s}\ttype:%s", name, r.Spec(), r.Type()))
}

func (r *ReportSender) getRpcClient() rpc.Client {
	return rpc.NewClientTimeout(time.Duration(10*time.Second), time.Duration(10*time.Second))
}
