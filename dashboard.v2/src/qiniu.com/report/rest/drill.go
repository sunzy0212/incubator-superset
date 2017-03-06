package rest

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"

	"github.com/qiniu/log.v1"
	"github.com/qiniu/rpc.v3/lb.v2"
)

type RestServerError struct {
	Message string `json:"errorMessage"`
}

func (e *RestServerError) Error() string {
	return e.Message
}

type DrillClient struct {
	client *lb.Client
}

func NewDrillClient(urls []string) *DrillClient {
	return &DrillClient{genClient(urls)}
}

/*
Get /storage.json
respose
例如：
[{
	"name" : "mongo",
	"config" : {
		"type" : "mongo",
		"connection" : "mongodb://localhost:27017/",
		"enabled" : false
	}
}
...
]
*/

func (c *DrillClient) GetStorages() (ret []Storage, err error) {
	uri := "/storage.json"
	err = c.doRequest("GET", uri, nil, &ret)
	return
}

/*
http://localhost:8047/storage/mongo.json
例如：
{
      "name" : "mongo",
      "config" : {
        "type" : "mongo",
        "connection" : "mongodb://localhost:27017/",
        "enabled" : false
      }
    }
*/
func (c *DrillClient) GetStorage(name string) (ret Storage, err error) {
	uri := fmt.Sprintf("/storage/%s.json", name)
	err = c.doRequest("GET", uri, nil, &ret)
	return
}

type PostRet struct {
	Result string `json:"result"`
}

func (c *DrillClient) PostStorage(config Storage) (ret PostRet, err error) {
	uri := fmt.Sprintf("/storage/%s.json", config.Name)
	configBytes, err := json.Marshal(config)
	if err != nil {
		log.Error(err)
		return
	}
	err = c.doRequest("POST", uri, bytes.NewReader(configBytes), &ret)
	if err != nil {
		log.Error(err)
		return
	}
	return
}

/* POST /query.json
request
{
      "queryType" : "SQL",
      "query" : "<Drill query>"
}

response
例如：
{
   "columns" : [ "id", "type", "name","sales" ],
   "rows" : [ {
     "id" : "0001",
     "sales" : "35",
     "name" : "Cake",
     "type" : "donut",
   } ]
 }
*/
func (c *DrillClient) Query(sql string) (ret Results, err error) {
	uri := "/query.json"
	body := map[string]string{
		"queryType": "SQL",
		"query":     sql,
	}
	bodyBytes, err := json.Marshal(body)
	if err != nil {
		log.Error(err)
		return
	}
	err = c.doRequest("POST", uri, bytes.NewReader(bodyBytes), &ret)
	if err != nil {
		log.Error(err)
	}
	return
}

// Get /profiles.json
func (c *DrillClient) GetProfiles() (ret Profiles, err error) {
	uri := "/profiles.json"
	err = c.doRequest("GET", uri, nil, &ret)
	if err != nil {
		log.Error(err)
	}
	return
}

//Get  /profiles/{queryid}.json
func (c *DrillClient) GetProfile(queryId string) (ret Profile, err error) {
	uri := fmt.Sprintf("/profiles/%s.json", queryId)
	err = c.doRequest("GET", uri, nil, &ret)
	if err != nil {
		log.Error(err)
	}
	return
}

//Get /profiles/cancel/{queryid}
func (c *DrillClient) CancelQuery(queryId string) (ret PostRet, err error) {
	uri := fmt.Sprintf("/profiles/cancel/%s", queryId)
	err = c.doRequest("GET", uri, nil, &ret)
	if err != nil {
		log.Error(err)
	}
	return
}

func (c *DrillClient) doRequest(method string, uri string, body io.ReaderAt, result interface{}) (err error) {
	req, err := lb.NewRequest(method, uri, body)
	if err != nil {
		log.Error(err)
		return err
	}
	req.Header.Set("Connection", "close")
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.client.Do(nil, req)
	if err != nil {
		log.Error(err)
		return err
	}
	defer resp.Body.Close()

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error(err)
		return err
	}
	if resp.StatusCode != http.StatusOK {
		return &RestServerError{Message: string(data)}
	}
	err = json.Unmarshal(data, result)
	if err != nil {
		err = fmt.Errorf(string(data))
		return
	}
	return
}
