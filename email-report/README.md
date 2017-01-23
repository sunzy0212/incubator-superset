# Pandora Mail Service

Pandora Mail Service is used for easily sending mail with `report theme`. 

# Example

```
curl -XPOST localhost:8080/v1/email -d '{
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
	"body": "这里是自定义的BODY部分",
	"subject":"EmailSubject",	
	"receivers":["rec1@example.com","rec2@example.com"],
	"cc_receiver":"cc@example.com"
}'
```

* 邮件发送成功:
<img align="right" src="http://oji8s4dhx.bkt.clouddn.com/EB51890D-59F6-498F-AF74-B4A22767ECC3.png"> 





# Using Golang

Just using struct:

```
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