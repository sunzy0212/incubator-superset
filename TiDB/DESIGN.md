用户的元数据存储在TiDB中，两张表

create database dbs: (uid,db_name)

create database tables: (db_name, tables)

怎么计费

## DB名字规则

DBName := fmt.Sprintf("%s_%s",<AppID>,<DBName>)

由appid和dbname组成，中间下划线连接

