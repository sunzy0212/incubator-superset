package sched

import (
	"fmt"
	"strings"

	"gopkg.in/robfig/cron.v2"
	"qiniu.com/report/common"
)

type Job interface {
	Run()
	Spec() string
	Name() string
	Type() string
}

type Scheduler struct {
	cron *cron.Cron
}

func NewScheduler() *Scheduler {
	c := cron.New()
	c.Start()
	return &Scheduler{c}
}

func (s *Scheduler) AddJob(job Job) (int, error) {
	id, err := s.cron.AddJob(job.Spec(), job)
	return int(id), err
}

func (s *Scheduler) RemoveJob(id int) {
	s.cron.Remove(cron.EntryID(id))
}

func (s *Scheduler) Start() {
	s.cron.Start()
}

func (s *Scheduler) Stop() {
	s.cron.Stop()
}

func Get(c common.Crontab) (Job, error) {
	switch strings.ToUpper(c.Type) {
	case "REPORT":
		return NewReportSender(c.Cron, c.Spec.(common.Reporter)), nil
	case "EMAIL":
		return NewEmailSender(c.Cron, c.Spec.(common.Email)), nil
	default:
		return nil, fmt.Errorf("%s not support yet", c.Type)
	}
}
