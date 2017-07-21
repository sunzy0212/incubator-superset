# 创建数据库

请求包: 

```
POST /v1/dbs/<DB_Name>
Content-Type: application/json

```

返回包:

```
200 OK
```


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
POST /v1/dbs/<DB_Name>/tables/<Table_Name>
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
POST /v1/dbs/<DB_Name>/tables/<Table_Name>/data
Content-Type: application/json
{
    <Key1>:<Value1>,
    <key2>:<Value2>,
    ...
}
```

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
[
    [<Value1>,<Value2>,...],
    ...
]
```