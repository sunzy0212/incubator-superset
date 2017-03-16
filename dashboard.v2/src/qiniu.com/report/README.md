# Pandora Report Specification


### 数据源管理
datasource数据结构

```
{
	id		string 
	name		string
	nickName	string
	host		string
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
POST /v1/datasources
Content-Type: application/json
{
	"name" : <Name>,
	"nickName" : <NickName>,
	"host" : <Host>,
	"port" : <Port>,
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
	"name" : <Name>,
	"nickName" : <NickName>,
	"host" :<Host>,
	"port" : <Port>,
    "type" : <Type>,
    "dbName" : <DbName>,
    "username" : <Username>,
    "password" : <Password>,
	"createTime" : <CreateTime>
}
```
#### 测试数据源
```
POST /v1/datasources/test
Content-Type: application/json
{
	"name" : <Name>,
	"nickName" : <NickName>,
	"host" : <Host>,
	"port" : <Port>,
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
#### 更新数据源

```
PUT /v1/datasources/<Id>
Content-Type: application/json
{
	"name" : <Name>,
	"nickName" : <NickName>,
	"host" : <Host>,
	"port" : <Port>,
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
GET /v1/datasources
```
返回包:

```
200 OK
Content-Type: application/json
{
	datasources: [
	{
		"id" : <Id>,
		"name" : <Name>,
		"nickName" : <NickName>,
		"host" : <Host>,
		"port" : <Port>,
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
请求包:

```
DELETE /v1/datasources/<Id>
```
返回包:

```
200 OK
```
#### 获取数据源信息（比如：表）
```
GET /v1/datasources/<Id>/tables
```
返回包:

```
200 OK
Content-Type: application/json
{
	tables: [
	{
		"datasourceId": <DatasourceId>,
		"name" : <Name>,
		"desc" : <Desc>
	},
	...
	]
}
```
#### 获取数据源信息（比如：表）
```
GET /v1/datasources/<Id>/tables/<TableName>
```
返回包:

```
200 OK
Content-Type: application/json
{
	"datasourceId": <DatasourceId>,
	"tableName": <TableName>,
	"fields": <Fields>,
	"desc": <Desc>
}
```

### 数据集管理
dataset数据结构

```
{
	id			string 
	name		string
	dataSources []string
	relationships 	[]Relationship
	dimensions 		[]Dimension  //fields sets
	measures 			[]Measure	//fields sets
	times 			[]string
	createTime  	timestamp
	updateTime 		timestamp
}
```
上述结构的子结构有：

```
RelationType
{
	INNER-JOIN
	FULL-JOIN
	LEFT-JOIN
	RIGHT-JOIN
}
DataSourceTable
{
	datasourceId string
	name string
}
Relationship
{
	left DataSourceTable
	right DataSourceTable
	relation RelationType
}

```

#### 创建数据集
```
PUT /v1/datasets
Content-Type: application/json
{
	"name" : <Name>,
}
```
返回包：

```
200 OK
Content-Type: application/json
{
	"id" : <Id>,
	"name" : <Name>
}
```
#### 更新数据集

```
PUT /v1/datasets/<Id>
Content-Type: application/json
{
	"name": <Name>,
	"dataSources": <DataSources>,
	"relationships": <Relationships>,
	"dimensions": <Dimensions>,
	"measures": <Measures>,
	"times":<Times>,
	"createTime": <createTime>,
	"updateTime": <updateTime>,
}
```
返回包：
```
200 OK
```

#### 获取数据集
```
GET /v1/datasets
```
返回包:

```
200 OK
Content-Type: application/json
{
	datasets: [
	{
		"id" : <Id>,
		"name": <Name>,
		"dataSources": <DataSources>,
		"relationships": <Relationships>,
		"dimensions": <Dimensions>,
		"measures": <Measures>,
		"times":<Times>,
		"createTime": <createTime>,
		"updateTime": <updateTime>,
	},
	...
	]
}
```

#### 删除数据集
请求包:

```
DELETE /v1/datasets/<Id>
```
返回包:

```
200 OK
```


### code(sql) 操作
数据结构如下:

```
{
	id			string
	name		string
	datasetId	  string
	selectFields []Field
	metricFields []Field
	groupFields  []Field
	timeField    Field
	wheres       []Evaluation
	havings      []Evaluation
	createTime 	timestamp
}
```
#### 创建code
```
POST /v1/datasets/<DatasetId>/codes
Content-Type: application/json
{
	"name" : <Name>,
	"SelectFields": <SelectFields>,
	"metricFields": <MetricFields>,
	"groupFields": <GroupFields>,
	"timeField": <TimeField>,
	"wheres": <Wheres>,
	"havings": <Havings>
}
```
返回包：

```
200 OK
{
	"id" : <Id>,
	"name" : <Name>,
	"datasetId": <DatasetId>,
	"SelectFields": <SelectFields>,
	"metricFields": <MetricFields>,
	"groupFields": <GroupFields>,
	"timeField": <TimeField>,
	"wheres": <Wheres>,
	"havings": <Havings>,
	"createTime": <CreateTime>
}
```

#### 更新code
```
PUT /v1/datasets/<DatasetId>/codes/<CodeId>
Content-Type: application/json
{
	"name" : <Name>,
	"SelectFields": <SelectFields>,
	"metricFields": <MetricFields>,
	"groupFields": <GroupFields>,
	"timeField": <TimeField>,
	"wheres": <Wheres>,
	"havings": <Havings>
}
```
返回包：

```
200 OK
```

####  获取code list
```
GET /v1/datasets/<DatasetId>/codes
200 ok
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
	"datasetId": <DatasetId>,
	"SelectFields": <SelectFields>,
	"metricFields": <MetricFields>,
	"groupFields": <GroupFields>,
	"timeField": <TimeField>,
	"wheres": <Wheres>,
	"havings": <Havings>,
	"createTime": <CreateTime>
	},
    ...
    ]
}
```
#### 获取code
```
GET /v1/datasets/<DatasetId>/codes/<Id>
200 ok
Content-Type: application/json
{
	"id" : <Id>,
	"name" : <Name>,
	"datasetId": <DatasetId>,
	"SelectFields": <SelectFields>,
	"metricFields": <MetricFields>,
	"groupFields": <GroupFields>,
	"timeField": <TimeField>,
	"wheres": <Wheres>,
	"havings": <Havings>,
	"createTime": <CreateTime>
}
```
#### 删除code
请求包

```
DELETE /v1/datasets/<DatasetId>/codes/<CodeId>
```
返回包

```
200 OK
```


### 报表相关 
dir
 
```
{
	id		string
	type	string
	name	string
	pre		string
	post	string
}
```
report

```
{
	id		string
	dirId	string
	name	string
	createTime	timestamp
}
```
chart 

```
{
	id		string
	title	string
	subTitle	string
	type		string //图表类型
	stack		bool
	codeId		string <ref code.id>
	dirId		string <ref dir.id>
}
```
#### 创建目录
```
POST /v1/dirs
Content-Type: application/json
{
	"name" : <Name>,
	"type" : <Type>,
	"pre" : <PreDir>,
	"post" : <PostDir>
}
```
返回包：

```
200 OK
```
#### 修改目录
```
PUT /v1/dirs/<Id>
Content-Type: application/json
{
    "name" : <Name>,
	"type" : <Type>,
	"pre" : <PreDir>,
	"post" : <PostDir>
}
```
返回包：

```
200 OK
```
#### 获取目录
```
GET /v1/dirs?type=<report|REPORT|chart|CHAHRT>
```
返回包

```
200 OK
Content-Type: application/json
{
 	"dirs": [
	{
		"id": <Id>,
		"type": <Type>,
		"name": <Name>,
		"pre": <Pre>,
		"subDir": <Null>,
		"accessTime": <accessTime>
	},
    {
		"id": <Id>,
		"name": <Name>,
		"type": <Type>,
		"pre": <Pre>,
		"subDir": [
		{	
			"id": <Id>,
			"type": <Type>,
			"name": <Name>,
			"pre": <Pre>,
			"subDir": <Null>,
			"accessTime": <accessTime>
		}
		],
		"accessTime": <accessTime>
    }
  ]
}
```
#### 删除目录
```
DELETE /v1/dirs/<Id>
```
返回包：

```
200 OK
```
#### 创建报表
```
POST /v1/reports
Content-Type: application/json
{
	"dirId": <DirId>,
    "name" : <Name>
}
```
返回包：

```
200 OK
```
#### 更新报表
```
PUT /v1/reports/<reportId>
Content-Type: application/json
{
    "dirId": <DirId>,
    "name" : <Name>
}
```
返回包：

```
200 OK
```

#### 获取报表列表
```
GET /v1/reports?dirId=<DirId>
```
返回包

```
200 OK
Content-Type: application/json
{
    reports: [
    {
        "id" : <Id>,
		"dirId":<DirId>,
        "name" : <Name>,
        "createTime" : <CreateTime>
    },
    ...
    ]
}
```
#### 获取报表
```
GET /v1/reports/<ReportId>
```
返回包

```
200 OK
Content-Type: application/json
{
	"id" : <Id>,
	"name" : <Name>,
	"createTime" : <CreateTime>
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

#### 添加 图表
```
POST /v1/charts
Content-Type: application/json
{
	"title" : <Title>,
	"subTitle" : <SubTitle>,
	"type" : <Type>,
	"lines" : <Lines>,
	"xaxis" : <Xaxis>,
	"yaxis" : <Yaxis>,
	"filters": <Filters>,
	"stack" : <True|False>,
	"codeId" : <CodeId>,
	"dirId" : <DirId>
}
```
注：Filters, Xaxis和Yaxis为[]Field类型，其值比如：[{name:'字段1',alais:'字段1别名'}]
返回包：

```
200 OK
{
	"id": <Id>,
	"title": <Title>,
	"subTitle" : <SubTitle>,
	"type" : <Type>,
	"lines" : <Lines>,
	"xaxis" : <Xaxis>,
	"yaxis" : <Yaxis>,
	"filters": <Filters>,
	"stack" : <True|False>,
	"codeId" : <CodeId>,
	"dirId" : <DirId>
}
```

#### 修改 图表
```
PUT /v1/charts/<ChartId>
Content-Type: application/json
{
	"title" : <Title>,
	"subTitle" : <SubTitle>,
	"type" : <Type>,
	"lines" : <Lines>,
	"xaxis" : <Xaxis>,
	"yaxis" : <Yaxis>,
	"filters": <Filters>,
	"stack" : <True|False>,
	"codeId" : <CodeId>,
	"dirId" : <DirId>
}
```
返回包：

```
200 OK
{
	"id": <Id>,
	"title": <Title>,
	"subTitle" : <SubTitle>,
	"type" : <Type>,
	"lines" : <Lines>,
	"xaxis" : <Xaxis>,
	"yaxis" : <Yaxis>,
	"filters": <Filters>,
	"stack" : <True|False>,
	"codeId" : <CodeId>,
	"dirId" : <DirId>
}
```
#### 获取chart list
```
GET /v1/charts?dirId=<DirId>
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
        "lines" : <Lines>,
	    "xaxis" : <Xaxis>,
	    "yaxis" : <Yaxis>,
		"filters": <Filters>,
	    "stack" : <True|False>,
	    "codeId" : <CodeId>,
	    "dirId" : <DirId>
    },
    ...
    ]
}
```

#### 获取chart
```
GET /v1/charts/<ChartId>
```
返回包

```
200 OK
Content-Type: application/json
{
    "title" : <Title>,
    "subTitle" : <SubTitle>,
    "type" : <Type>,
    "lines" : <Lines>,
    "xaxis" : <Xaxis>,
    "yaxis" : <Yaxis>,
	"filters": <Filters>,
    "stack" : <True|False>,
    "codeId" : <CodeId>,
    "dirId" : <DirId>
}
```

#### 删除chart
请求包

```
DELETE /v1/charts/<ChartId>
```
返回包

```
200 OK
```


### 布局信息
```
{
	reportId  string
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
			"data" : <DataMap>
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
返回包:

```
200 OK
Content-Type: application/json
{
	"reportId" : <ReportId>,
	"layouts" : [
        {
            "chartId" : <ChartId>,
            "data" : <DataMap>
        }
    ]
}
```
### 数据查询接口
```
POST /v1/datas?codeId=<CodeId>&type=<DataType>
{
	"wheres": <Wheres>,
}

或者
POST /v1/datas?type=<DataType>
{
	"datasetId": <DatasetId>,
	"selectFields": <SelectFields>,
	"metricFields": <MetricFields>,
	"groupFields": <GroupFields>,
	"timeField": <TimeField>,
	"wheres": <Wheres>,
	"havings": <Havings>
}
```

返回包

```
200 OK
Content-Type: application/json
{
	"type": <DataType>,
	"datas": [
	{key1:<val1>,key2:<val2>,key3:<val3>...}
	{key1:<val1>,key2:<val2>,key3:<val3>...}
	...
	]
}
```
或者

```
{
	type: <DataType>,
	datas: [
		[key1,key2,key3...]
		[val1,val2,val3...]
		[val1,val2,val3...]
	]
}
```
注：

+ `type`为数据类型 可选`json`,`csv`,`excel`

