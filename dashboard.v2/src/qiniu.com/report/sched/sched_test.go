package sched

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"testing"
	"time"

	"qiniu.com/report/common"
)

func TestClient(t *testing.T) {
	c := NewReportSender("", common.Reporter{}).getRpcClient()
	var ret interface{}
	err := c.Call(nil, &ret, "http://localhost:8000/v1/datas?codeId=code_AOdheKlAGZeqVPC4&type=json")
	t.Log(ret, err)
}

func TestAddJobs(t *testing.T) {
	s := NewScheduler()
	id, _ := s.AddJob(NewDummy("* * * * * ?", DummyConfig{Name: "Dummy1"}))
	fmt.Println("4s后删除job", id)
	time.Sleep(4 * time.Second)
	s.RemoveJob(id)
	fmt.Println("不在执行任务了")
	time.Sleep(10 * time.Second)
	fmt.Println("exit")
	s.Stop()
}

func TestSendEmail(t *testing.T) {
	e := common.Email{Subject: "邮件测试",
		Username: "wenchenxin@qiniu.com",
		Password: "******************",
		Receiver: []string{"wenchenxin@qiniu.com"},
	}
	body := []byte("")
	response, err := http.Get("https://godoc.org/gopkg.in/gomail.v2")
	if err != nil {
		t.Error(err)
	} else {
		defer response.Body.Close()
		body, err = ioutil.ReadAll(response.Body)
		if err != nil {
			t.Error(err)
		}
	}
	client := newEmailClient(e, body)
	err = client.Send()
	t.Log(err)
}

func TestReport(t *testing.T) {
	cfg := common.Reporter{
		ReportId: "report_AEGA0FJvMarj4ZOI",
		PreDirId: "dir_DKSWQHmNyHmhRFud",
		Name:     "test report",
		Rules:    []string{"yyyy-MM-dd"},
	}
	client := NewReportSender("", cfg)
	client.Run()
}
