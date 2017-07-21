# 七牛BI Studio

superset -> TiDB

其中superset作为展示层，TiDB作为数据存储层，需要注意的是TiDB并不是作为RDS的存在，仅仅是superset的后端。

## superset的多租户

superset本身由账户系统，需要和七牛的账户系统对接上。

如何对接？两种方法

1. portal上点进来，不需要输入密码，类似workflow的方法
2. superset登录页面，输入七牛的用户名密码，单独登录，不和portal进行连接

以上两种方法需要解决的问题

1. 需要去掉superset的登录页面，并和七牛的对接上
2. 需要将superset的登录方式和七牛的登录方式对接上

以上两种方法 哪种方法简单用哪种（鉴于目前的工期），感觉2简单。


## TiDB多租户

以数据库为单位，一个用户可以根据业务的不同创建多个数据库

原声的TiDB是直接用mysql协议来进行各种操作的，比如资源创建、数据写入、数据查询等。

我们不能直接沿用mysql协议，因为没有办法使用当前的这套鉴权系统，所以需要使用熟悉的http协议，在apiserver的内部进行转化。


## superset和TiDB的连接

### 怎么连接

superset通过http协议连接Pandora TiDB进行查询

### 如何鉴权

通过ak，sk鉴权

## 主要的任务

* TiDB的多租户
* supserset接入七牛的用户账户体系
* supserset增加Pandora TiDB数据源(走http协议，而不是mysql协议)
* Pandora TiDB需要一个简易Portal，用来创建资源