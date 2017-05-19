package tsdb

import (
	"fmt"
	"reflect"
	"strings"
	"testing"
	//	"time"

	"github.com/davecgh/go-spew/spew"
	. "qiniu.com/pandora/base"
	"qiniu.com/pandora/base/config"
	//	"qiniu.com/pandora/base/reqerr"
	. "qiniu.com/pandora/tsdb"
)

var (
	cfg      *config.Config
	client   TsdbAPI
	region   = "nb"
	endpoint = "https://tsdb.qiniu.com"
	ak       = "ukY1XJ3I6KqdcAhRDtKLsA-JBeZJ8jF3WAvHh61O"
	sk       = "HHGg_uCHzQUYOGAI3gStFwKiIJnCCPJ86tm6Ky5P"
	logger   Logger
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
		logger.Error("new pipeline client failed, err: %v", err)
	}

}

func TestRepo(t *testing.T) {
	setUp()
	repoName := "report_tsdb_test_tmp"
	//create repo
	err := client.CreateRepo(&CreateRepoInput{
		RepoName: repoName,
		Region:   region,
	})
	if err != nil {
		t.Fatal("create repo fail: ", err)
	}

	//ensure repo created
	repo, err := client.GetRepo(&GetRepoInput{RepoName: repoName})
	if err != nil {
		t.Fatal("get repo fail: ", err)
	}

	if repo.RepoName != repoName {
		t.Fatal("repoName does not match")
	}

	//list repo
	repos, err := client.ListRepos(&ListReposInput{})
	if err != nil {
		t.Error(err)
	}
	t.Log(repos)

	//update metadata
	metadate := map[string]string{"key1": "val1"}
	err = client.UpdateRepoMetadata(&UpdateRepoMetadataInput{
		RepoName: repoName,
		Metadata: metadate,
	})
	if err != nil {
		t.Fatal("update repo metadata fail: ", err)
	}

	//ensure updated
	repo, err = client.GetRepo(&GetRepoInput{RepoName: repoName})
	if err != nil {
		t.Fatal("get repo fail: ", err)
	}
	if !reflect.DeepEqual(repo.Metadata, metadate) {
		t.Fatal("update repo metadata fail: ", err)
	}

	//delete metadata
	err = client.DeleteRepoMetadata(&DeleteRepoMetadataInput{RepoName: repoName})
	if err != nil {
		t.Fatal("delete repo metadata fail: ", err)
	}
	//ensure deleted
	repo, err = client.GetRepo(&GetRepoInput{RepoName: repoName})
	if err != nil {
		t.Fatal("get repo fail: ", err)
	}
	exp := map[string]string{}
	exp = nil
	if !reflect.DeepEqual(repo.Metadata, exp) {
		t.Fatal("delete repo metadata fail: ", spew.Sdump(repo.Metadata), spew.Sdump(exp))
	}

	//delete repo
	err = client.DeleteRepo(&DeleteRepoInput{RepoName: repoName})
	if err != nil {
		t.Fatal("delete repo fail: ", err)
	}
}

func TestPointing(t *testing.T) {
	setUp()
	repoName := "report_tsdb_test"
	seriesName := "report_s"

	var repo *GetRepoOutput
	var err error
	if repo, err = client.GetRepo(&GetRepoInput{RepoName: repoName}); err != nil {
		t.Fatal(err)
	}

	if repo.RepoName == "" {
		err := client.CreateRepo(&CreateRepoInput{RepoName: repoName, Region: region})
		if err != nil {
			t.Fatal(err)
		}
	}

	if err := client.CreateSeries(&CreateSeriesInput{
		RepoName:   repoName,
		SeriesName: seriesName,
		Retention:  "forever",
	}); err != nil {
		//		if err != reqerr.SeriesAlreadyExistsError {
		//			t.Fatal(err)
		//		}
	}

	var series *ListSeriesOutput
	if series, err = client.ListSeries(&ListSeriesInput{RepoName: repoName}); err != nil {
		t.Fatal(err)
	}
	t.Logf("%#v", series)

	points := make([]Point, 5)
	n := 5
	for i := 0; i < n; i++ {
		points[i] = Point{
			SeriesName: seriesName,
			Tags:       map[string]string{"server": fmt.Sprintf("nb12%d", i/2), "idc": "nb"},
			Fields: map[string]interface{}{
				"cpu":   i * 11,
				"mem":   (i+i)*10 + (i - i*10),
				"level": fmt.Sprintf("level_%d", i/2),
			},
		}
	}
	if err := client.PostPoints(&PostPointsInput{
		RepoName: repoName,
		Points:   points,
	}); err != nil {
		t.Fatal(err)
	}

	ret, err := client.QueryPoints(&QueryInput{RepoName: repoName,
		Sql: fmt.Sprintf("SHOW TAG KEYS FROM  %s", seriesName)})
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%#v", ret.Results[0].Series)
	if len(ret.Results[0].Series) > 0 {
		for _, v := range ret.Results[0].Series[0].Values {
			t.Log(v)
		}
	}

	ret, err = client.QueryPoints(&QueryInput{RepoName: repoName,
		Sql: fmt.Sprintf("SHOW FIELD KEYS FROM %s", seriesName)})
	if err != nil {
		t.Fatal(err)
	}
	t.Log(ret.Results[0].Series[0].Values)

	ret, err = client.QueryPoints(&QueryInput{RepoName: repoName,
		Sql: fmt.Sprintf("SELECT * FROM %s LIMIT 3", seriesName)})
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%#v", ret.Results[0].Series[0])
	res := ret.Results[0].Series[0]
	if len(ret.Results[0].Series) > 0 {
		for _, v := range res.Values {
			//t.Log(res.Columns)
			row := make(map[string]interface{})
			for i, f := range res.Columns {
				if v[i] != nil {
					row[f] = v[i]
				}
			}
			t.Logf("%#v", row)
		}
	}
}
