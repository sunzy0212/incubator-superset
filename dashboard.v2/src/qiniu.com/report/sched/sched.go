package sched

import (
	"fmt"
	"strings"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"gopkg.in/robfig/cron.v2"
	"qiniupkg.com/x/log.v7"

	"qiniu.com/report/common"
	"qiniu.com/report/common/db"
)

type Job interface {
	Run()
	Spec() string
	Name() string
	Type() string
}

type Scheduler struct {
	cron  *cron.Cron
	colls *common.Collections
}

type M map[string]interface{}

func NewScheduler(colls *common.Collections) *Scheduler {

	c := cron.New()
	c.Start()
	sched := &Scheduler{c, colls}
	sched.recoverJobs()
	return sched
}

func (s *Scheduler) recoverJobs() {
	var crons []common.Crontab
	if err := s.colls.CrontabColl.Find(M{}).All(&crons); err != nil {
		if err == mgo.ErrNotFound {
			err = nil
		} else {
			log.Error("Error when recovy crontab jobs ~ ", err)
		}
		return
	}
	log.Infof("try to recover %d cron job", len(crons))
	for _, cron := range crons {
		if cron.Type == "REPORT" {
			var tmp common.Reporter
			data, _ := bson.Marshal(cron.Spec)
			bson.Unmarshal(data, &tmp)
			cron.Spec = tmp
		}
		if cron.Type == "EMAIL" {
			var tmp common.Email
			data, _ := bson.Marshal(cron.Spec)
			bson.Unmarshal(data, &tmp)
			cron.Spec = tmp
		}
		job, err := Get(cron)
		if err != nil {
			log.Error(err)
			continue
		}
		jobId, err := s.AddJob(job)
		if err != nil {
			log.Error(err)
			continue
		}
		if err = db.DoUpdate(s.colls.CrontabColl,
			M{"id": cron.Id},
			M{"$set": M{"jobId": jobId, "updateTime": common.GetCurrTime()}}); err != nil {
			log.Error(err)
			continue
		}
	}
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
