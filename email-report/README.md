# Pandora Mail Service

Pandora Mail Service is used for easily sending mail with `report theme`. 

# 增加uid查询用户信息的接口

    Request:

    curl 'localhost:6080/v1/user?uid=<UID>'

    Response:

    {
      "code": 200,
      "data": {
        "uid": 1380013800,
        "email": "example@qiniu.com",
        "fullname": "七牛",
        "is_enterprise": false,
        "is_certified": true
      }
    }

目前部署在nb1684:6080(192.168.77.25:6080)
# Example

```
curl -XPOST 'localhost:6080/v1/mail' -d  '{
		"table_contents":[
				{
					"title":"报表1",
					    "table_header":["年龄","姓名"],
					"table_rows":[
						[12,"pandora"],
						[14,"pandoraV2"]
					]
				},
				{
					"title":"报表2", 
					"table_header":["年龄2","姓名2"],
					"table_rows":[
						["12","pandora"],
						["14","pandoraV2"]
					]
				}
			],
			"body":"这里是自定义的BODY部分",
			"subject":"EmailSubject",
			"receivers":["example@qiniu.com"],
			"cc_receiver":""
}'
```

* 邮件发送成功:
<img align="right" src="http://oji8s4dhx.bkt.clouddn.com/tempalteDaemon.png"> 





# Using Golang

Just using struct:

```
type rowHeader []string
type rowData [][]interface{}
// html table 
type Table struct {
	Title       string    `json:"title"`
	TableHeader rowHeader `json:"table_header"`
	TableRows   rowData   `json:"table_rows"`
}

type Service struct {
	TableContents []Table  `json:"table_contents,omitempty"`
	Body          string   `json:"body,omitempty"`
	Subject       string   `json:"subject"`
	Receivers     []string `json:"receivers"`
	CCReceiver    string   `json:"cc_receiver"`
}
```