package rest

import (
	"net"
	"net/http"
	"time"

	"github.com/qiniu/rpc.v3/lb.v2"
)

const (
	defaultDialTimeout           = time.Second * 30
	defaultResponseHeaderTimeout = time.Second * 60
)

type StorageConfig struct {
	Type       string                 `json:"type"`
	Enabled    bool                   `json:"enabled"`
	Url        string                 `json:"url,omitempty"`
	Driver     string                 `json:"driver,omitempty"`
	Username   string                 `json:"username,omitempty"`
	Password   string                 `json:"password,omitempty"`
	Connection string                 `json:"connection,omitempty"`
	Workspaces map[string]interface{} `json:"workspaces,omitempty"`
	Formats    map[string]interface{} `json:"formats,omitempty"`
}
type Storage struct {
	Name   string        `json:"name"`
	Config StorageConfig `json:"config"`
}

type Results struct {
	Columns []string                 `json:"columns"`
	Rows    []map[string]interface{} `json:"rows"`
}

func (r *Results) FieldNames() []string {
	return r.Columns
}

type Profiles struct {
	RunningQueries  []string `json:"runningQueries"`
	FinishedQueries []struct {
		QueryId  string `json:"queryId"`
		Time     string `json:"time"`
		Location string `json:"location"`
		Foreman  string `json:"foreman"`
		Query    string `json:"query"`
		State    string `json:"state"`
		User     string `json:"user"`
	} `json:"finishedQueries"`
}

type Profile struct {
	Type  int    `json:"type"`
	Start int64  `json:"start"`
	End   int64  `json:"end"`
	Query string `json:"query"`
	User  string `json:"user"`
}

type Result struct {
	Result string `json:"result"`
}

type Client interface {
	GetStorages() (ret []Storage, err error)
	GetStorage(name string) (ret Storage, err error)
	PostStorage(config Storage) (ret Result, err error)
	Query(sql string) (ret Results, err error)
	GetProfiles() (ret Profiles, err error)
	GetProfile(queryId string) (ret Profile, err error)
	CancelQuery(queryId string) (ret Result, err error)
}

func genClient(hosts []string) *lb.Client {
	dialer := &net.Dialer{Timeout: defaultDialTimeout}
	t := &http.Transport{
		Dial:                  dialer.Dial,
		DisableKeepAlives:     true,
		ResponseHeaderTimeout: defaultResponseHeaderTimeout,
	}
	cfg := &lb.Config{
		Http:              &http.Client{Transport: t},
		FailRetryInterval: -1,
		TryTimes:          1,
	}
	client, err := lb.New(hosts, cfg)
	if err != nil {
		panic(err)
	}
	return client
}
