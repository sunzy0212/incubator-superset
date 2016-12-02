# Pandora Report Specification


### 数据源管理
dataset数据结构
```
{
	id			string 
	Host		string
	port		int
	type		string  //数据源类型：可选MYSQL/MGO/Spark...
	dbName		string
	username	string
	password	string
	createTime  timestamp

}
```

#### 创建数据源
```
POST /v1/datasets
Content-Type: application/json
{
    "type" : <Type>,
    "dbName" : <DbName>,
    "username" : <Username>,
    "password" : <Password>
}
```
返回包：
```
200 OK
Content-Type: application/json
{
	"id" : <Id>,
    "type" : <Type>,
    "dbName" : <DbName>,
    "username" : <Username>,
    "password" : <Password>,
	"createTime" : <CreateTime>
}
```
#### 更新数据源

```
PUT /v1/datasets/<Id>
Content-Type: application/json
{
    "type" : <Type>,
    "dbName" : <DbName>,
    "username" : <Username>,
    "password" : <Password>
}
```
返回包：
```
200 OK
```

#### 获取数据源
```
GET /v1/datasets
```
返回包
```
200 OK
Content-Type: application/json
{
	datasets: [
	{
		"id" : <Id>,
		"type" : <Type>,
		"dbName" : <DbName>,
		"username" : <Username>,
		"password" : <Password>,
		"createTime" : <CreateTime>
	},
	...
	]
}
```
#### 删除数据源
请求包
```
DELETE /v1/datasets/<Id>
```
返回包
```
200 OK
```

### code(sql) 操作
数据结构如下:
```
{
	id		string
	name	string
	code	string
	datasetId	string
	type	string
	createTime timestamp
}
```
#### 创建code
```
POST /v1/codes
Content-Type: application/json
{
	"name" : <Name>,
	"code" : <Code>,
	"type" : <Type>,
	"datasetId" : <DatasetId>    
}
```
返回包：
```
200 OK
```

#### 更新code
```
PUT /v1/codes/<Id>
Content-Type: application/json
{
    "name" : <Name>,
    "code" : <Code>,
    "type" : <Type>,
    "datasetId" : <DatasetId>
}
```
返回包：
```
200 OK
```

#### 获取code
```
GET /v1/codes?type=<DbType>
```
返回包
```
200 OK
Content-Type: application/json
{
    codes: [
    {
        "id" : <Id>,
        "name" : <Name>,
        "type" : <Type>,
		 "code" : <Code>,
        "dbName" : <DbName>,
        "createTime" : <CreateTime>
    },
    ...
    ]
}
```
#### 删除code
请求包
```
DELETE /v1/codes/<Id>
```
返回包
```
200 OK
```


### 报表相关 
report
```
{
	id string
	name string
	createTime timestamp
}
```

chart 
```
{
	id string,
	title string,
	subTitle string,
	type string, //图表类型
	stack bool,
	codeId string <ref code.id>
	reportId string <ref report.id>
}
```

#### 创建报表
```
POST /v1/reports
Content-Type: application/json
{
    "name" : <Name>
}
```
返回包：
```
200 OK
```
#### 获取报表
```
GET /v1/reports
```
返回包
```
200 OK
Content-Type: application/json
{
    reports: [
    {
        "id" : <Id>,
        "name" : <Name>,
        "createTime" : <CreateTime>
    },
    ...
    ]
}
```
#### 删除报表
请求包
```
DELETE /v1/reports/<Id>
```
返回包
```
200 OK
```

#### 添加/修改图表
```
POST /v1/reports/<ReportId>/charts/<ChartId>
Content-Type: application/json
{
	"title" <Title>,
	"subTitle" : <SubTitle>,
	"type" : <Type>,
	"stack" : <True|False>,
	"codeId" : <CodeId>,
	"reportId" : <ReportId>,
	"code" : <Code>
}
```
返回包：
```
200 OK
```
#### 获取chart list
```
GET /v1/reports/<ReportId>/charts
```
返回包
```
200 OK
Content-Type: application/json
{
    "charts": [
    {
		"id" : <Id>,
        "title" <Title>,
        "subTitle" : <SubTitle>,
        "type" : <Type>,
        "stack" : <True|False>,
        "codeId" : <CodeId>,
		"reportId" : <ReportId>
    },
    ...
    ]
}
```

#### 获取chart
```
GET /v1/reports/<ReportId>/charts/<ChartId>
```
返回包
```
200 OK
Content-Type: application/json
{
    "title" <Title>,
    "subTitle" : <SubTitle>,
    "type" : <Type>,
    "stack" : <True|False>,
    "codeId" : <CodeId>,
	"code" : <Code>
}
```

#### 删除chart
请求包
```
DELETE /v1/reports/<ReportId>/charts/<ChartId>
```
返回包
```
200 OK
```


### 布局信息
```
{
	reportId  string ,
	layouts   []map[string]interface
}
```

#### 保存/更新 某报表布局信息
```
POST /v1/layouts/<ReportId>
Content-Type: application/json
{
	"layouts" : [
		{	
			"chartId" : <ChartId>,
			"data" : <Map>
		}
	]
}
```
返回包：
```
200 OK
```
#### 获取报表布局信息
```
GET /v1/layouts/<ReportId>
```
返回包
```
200 OK
Content-Type: application/json
{
	"reportId" : <ReportId>,
	"layouts" : [
        {
            "chartId" : <ChartId>,
            "data" : <Map>
        }
    ]
}
```
### 数据查询接口
```
GET /v1/datas?q=<CodeId>&type=<ChartType>
```
返回包
```
200 OK
Content-Type: application/json
{
	"type" : "ChartType",
    "tags": [
        ...        //tags值
    ],
    "datas": [
        ["",""]  
		...
    ]
}
```
或者
```
{
	"type" : "ChartType"
    "tags":[
        ...
    ],
    "times":[
        ["",""],
        ...
    ],
    "datas":[
        [123,...]
        ...
    ]
}
```
注：

+ `q` 为codeId
+ `type`为图表类型 可选`line`,`bar`,`pie`

