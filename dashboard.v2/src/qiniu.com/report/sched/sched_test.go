package sched

import (
	"fmt"
	"testing"
	"time"
)

func TestClient(t *testing.T) {
	c := NewReport("", ReportConfig{}).getRpcClient()
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
