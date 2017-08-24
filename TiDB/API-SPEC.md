# 激活用户

请求包: 

```
POST /v1/activate
Content-Type: application/json

```

返回包:

```
200 OK
json {
    "user":<UserId>,
    "password":<Password>
}
```

* 此接口用来给特定的qiniu uid生成数据库的用户名和密码

# 创建数据库

请求包: 

```
POST /v1/dbs/<DB_Name>?ignoreExists=true
Content-Type: application/json

```

返回包:

```
200 OK
```

* `ignoreExists`: 用来指定是否忽略数据库已经被创建了的错误；`true`: 忽略，`false`: 不忽略；

# 列举数据库

请求包: 

```
GET /v1/dbs
Content-Type: application/json

```

返回包:

```
200 OK
json
[
    <DB1>,
    <DB2>,
    <DB3>
]
```

# 删除数据库

请求包: 

```
DELETE /v1/dbs/<DB_Name>
Content-Type: application/json

```

返回包:

```
200 OK

```

# 创建数据表

```
POST /v1/dbs/<DB_Name>/tables
Content-Type: application/json
{
    "cmd":<Mysql_Command>
}
```

返回包:

```
200 OK
```

# 修改数据表

```
PUT /v1/dbs/<DB_Name>/tables/<Table_Name>
Content-Type: application/json
{
    "cmd":<Mysql_Command>
}
```

返回包:

```
200 OK
```

# 列举数据表

请求包: 

```
GET /v1/dbs/<DB_Name>/tables
Content-Type: application/json

```

返回包:

```
200 OK
json
[
    <Table1>,
    <Table2>,
    <Table3>
]
```

# 列举单个数据表

请求包: 

```
GET /v1/dbs/<DB_Name>/tables/<Table_Name>
Content-Type: application/json

```

返回包:

```
200 OK
json
[
    {
        "Field":<Field>,
        "Type":<Type>,
        "Null":<Null>,
        "Key":<Key>,
        "Default":<Default>,
        "Extra":<Extra>
    },
    ...
]
```


# 删除数据表

```
DELETE /v1/dbs/<DB_Name>/tables/<Table_Name>
Content-Type: application/json
{
    "cmd":<Mysql_Command>
}
```

返回包:

```
200 OK
```

# 写入数据点

```
POST /v1/dbs/<DB_Name>/tables/<Table_Name>/data?spliter=<Spliter>&ommitInvalid=<True|False>
Content-Type: application/json
{
    <ColumnKey1>,<ColumnKey2>,<ColumnKey3>,...
    <Value1>,<Value2>,<Value3>,...
    ...
}
```

* 数据格式本质上是CSV格式
* 请求体的第一行永远是column key，默认用逗号分割,如果要更改分隔符，请在url中指定<Spliter>
* 从第二行开始是数据，数据的列数必须和column key的数量一致
* ommitInvalid: 是否忽略错误的点

返回包:

```
200 OK
```

# 查询数据点

```
POST /v1/dbs/<DB_Name>/query
Content-Type: application/json
{
    "cmd":<Mysql_Command>
}
```

返回包:

```
200 OK
{
    "results":[
        {
            "columns":[<ColumnKey1>,<ColumnKey2>,<ColumnKey3>,...],
            "rows":[
                [<Value1>,<Value2>,<Value3>,...],
                ...
            ]
        },
        ...
    ]
}
```