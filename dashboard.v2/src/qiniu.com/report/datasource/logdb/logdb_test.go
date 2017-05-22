package logdb

import (
	"testing"
	"time"

	. "qiniu.com/pandora/base"
	"qiniu.com/pandora/base/config"
	. "qiniu.com/pandora/logdb"
)

var (
	cfg               *config.Config
	client            LogdbAPI
	region            = "nb"
	endpoint          = "https://logdb.qiniu.com"
	ak                = ""
	sk                = ""
	logger            Logger
	defaultRepoSchema []RepoSchemaEntry
)

func setUp() {
	logger = NewDefaultLogger()
	cfg = NewConfig().
		WithEndpoint(endpoint).
		WithAccessKeySecretKey(ak, sk).
		WithLogger(logger).
		WithLoggerLevel(LogDebug)

	var err error
	client, err = New(cfg)

	if err != nil {
		logger.Error("new logdb client failed, err: %v", err)
	}

	defaultRepoSchema = []RepoSchemaEntry{
		RepoSchemaEntry{
			Key:       "f1",
			ValueType: "string",
		},
		RepoSchemaEntry{
			Key:       "f2",
			ValueType: "float",
		},
		RepoSchemaEntry{
			Key:       "f3",
			ValueType: "date",
		},
		RepoSchemaEntry{
			Key:       "f4",
			ValueType: "long",
		},
	}

}

func TestRepo(t *testing.T) {
	setUp()

	repoName := "report_logdb_test"
	//	createInput := &CreateRepoInput{
	//		RepoName:  repoName,
	//		Region:    region,
	//		Schema:    defaultRepoSchema,
	//		Retention: "2d",
	//	}

	//	err := client.CreateRepo(createInput)
	//	if err != nil {
	//		t.Error(err)
	//	}

	getOutput, err := client.GetRepo(&GetRepoInput{RepoName: repoName})
	if err != nil {
		t.Error(err)
	}
	if getOutput == nil {
		t.Error("repo ret is empty")
	}

	listOutput, err := client.ListRepos(&ListReposInput{})
	if err != nil {
		t.Error(err)
	}
	if listOutput == nil {
		t.Error("repo list should not be empty")
	}
	t.Logf("%#v", listOutput)

	//	err = client.DeleteRepo(&DeleteRepoInput{RepoName: repoName})
	//	if err != nil {
	//		t.Error(err)
	//	}

	//	startTime := time.Now().Unix() * 1000
	for i := 0; i < 5; i++ {
		sendLogInput := &SendLogInput{
			RepoName:       repoName,
			OmitInvalidLog: false,
			Logs: Logs{
				Log{
					"f1": "v11",
					"f2": 1.0,
					"f3": time.Now().UTC().Format(time.RFC3339),
					"f4": 1312,
				},
				Log{
					"f1": "v21",
					"f2": 1.2,
					"f3": time.Now().UTC().Format(time.RFC3339),
					"f4": 3082,
				},
				Log{
					"f1": "v31",
					"f2": 0.0,
					"f3": time.Now().UTC().Format(time.RFC3339),
					"f4": 1,
				},
				Log{
					"f1": "v41",
					"f2": 0.3,
					"f3": time.Now().UTC().Format(time.RFC3339),
					"f4": 12345671,
				},
			},
		}
		sendOutput, err := client.SendLog(sendLogInput)
		if err != nil {
			t.Error(err)
		}
		if sendOutput.Success != 4 || sendOutput.Failed != 0 || sendOutput.Total != 4 {
			t.Errorf("send log failed, success: %d, failed: %d, total: %d", sendOutput.Success, sendOutput.Failed, sendOutput.Total)
		}
	}
}

func TestLogDBForReportApi(t *testing.T) {
	repoName := "report_logdb_test"
	res, err := client.GetRepo(&GetRepoInput{RepoName: repoName})
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%#v", res)

	ret, err := client.QueryLog(&QueryLogInput{
		RepoName: repoName,
	})
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%#v", ret)
}
