# Pandora Report Specification


### 数据源管理
dataset数据结构
```
{
	id			string 
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
    "type" : <type>
    "dbName" : <dbName>
    "username" : <username>
    "password" : <password>
    "createTime" : <CreateTime>
}
```
返回包：
```
200 OK
```
#### 更新数据源

```
PUT /v1/datasets/<id>
Content-Type: application/json
{
    "type" : <type>
    "dbName" : <dbName>
    "username" : <username>
    "password" : <password>
    "createTime" : <CreateTime>
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
		"id" : <id>
		"type" : <type>
		"dbName" : <dbName>
		"username" : <username>
		"password" : <password>
		"createTime" : <CreateTime>
	},
	...
	]
}
```
#### 删除数据源
请求包
```
DELETE /v1/datasets/<id>
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
	dbName	string
	type	string
	createTime timestamp
}
```
#### 创建code
```
POST /v1/codes
Content-Type: application/json
{
	"name" : <name>
	"code" : <code>
    "type" : <type>
    "dbName" : <dbName>
    "createTime" : <CreateTime>
}
```
返回包：
```
200 OK
```

#### 创建code
```
PUT /v1/codes/<id>
Content-Type: application/json
{
    "name" : <name>
    "code" : <code>
    "type" : <type>
    "dbName" : <dbName>
    "updateTime" : <updateTime>
}
```
返回包：
```
200 OK
```

#### 获取code
```
GET /v1/codes
```
返回包
```
200 OK
Content-Type: application/json
{
    codes: [
    {
        "id" : <id>
        "name" : <name>
        "type" : <type>
		"code" : <code>
        "dbName" : <dbName>
        "createTime" : <CreateTime>
    },
    ...
    ]
}
```
#### 删除code
请求包
```
DELETE /v1/codes/<id>
```
返回包
```
200 OK
```


### 创建报表 
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
	id string
	title string
	subTitle string
	type string //图表类型
	stack bool
	codeId string <ref code.id>
}
```

#### 创建报表
```
POST /v1/reports
Content-Type: application/json
{
    "name" : <name>
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
        "id" : <id>
        "name" : <name>
        "createTime" : <CreateTime>
    },
    ...
    ]
}
```
#### 删除报表
请求包
```
DELETE /v1/reports/<id>
```
返回包
```
200 OK
```

#### 添加/修改图表
```
POST /v1/reports/<reportId>/charts/<chartId>
Content-Type: application/json
{
	"title" <title>
	"subTitle" : <subTitle>
	"type" : <type>
	"stack" : <true/false>
	"codeId" : <codeId>
}
```
返回包：
```
200 OK
```
#### 获取chart list
```
GET /v1/reports/<reportId>/charts
```
返回包
```
200 OK
Content-Type: application/json
{
    charts: [
    {
		"id" : <id>
        "title" <title>
        "subTitle" : <subTitle>
        "type" : <type>
        "stack" : <true|false>
        "codeId" : <codeId>
    },
    ...
    ]
}
```

#### 获取chart
```
GET /v1/reports/<reportId>/charts/<chartId>
```
返回包
```
200 OK
Content-Type: application/json
{
    "title" <title>
    "subTitle" : <subTitle>
    "type" : <type>
    "stack" : <true/false>
    "codeId" : <codeId>
}
```

#### 删除chart
请求包
```
DELETE /v1/reports/<reportId>/charts/<chartId>
```
返回包
```
200 OK
```


### 布局信息
```
{
	reportId string 
	chartId string
	data map{}
}
```

#### 保存/更新 某报表布局信息
```
POST /v1/layouts/<layoutId>
Content-Type: application/json
{
    "reportId" : <layoutId>
    "chartId" : <chartId>
	"data" : <dataset>
}
```
返回包：
```
200 OK
```
注：layoutId 其实应该为reportId
#### 获取报表布局信息
```
GET /v1/layouts/<layoutId>
```
返回包
```
200 OK
Content-Type: application/json
{
	"reportId" : <layoutId>
    "chartId" : <chartId>
    "data" : <dataset>
}
```


