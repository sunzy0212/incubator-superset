# 七牛BI Studio

superset -> TiDB

其中superset作为展示层，TiDB作为数据存储层，需要注意的是TiDB并不是作为RDS的存在，仅仅是superset的后端。

## 架构&原理图

![bi studio工作原理图](https://pandora-kibana.qiniu.com/report-arch.png)

1. 数据的入口是workflow，数据通过导出任务导入到bi studio
2. 数据的出口是superset，用来对数据进行可视化
3. Bi-Studio apiserver主要进行元数据的管理和权限控制
4. TiDB实际存储数据

## 使用方式

1. 在workflow在创建导出任务的时候创建bi sudtio的数据库和数据表
2. 在workflow创建导出任务，将数据导出到bi studio节点
3. 打开supserset可以看到在workflow上已经创建好的数据库和数据表
4. 根据业务生成superset的图表（报表）
5. 创建看板,将前一步生成的报表添加进看板

## 部署地址

### cs staging 地址

1. TiDB: cs57:5000(10.200.20.68:5000)
2. Bi-Studio apiserver: cs57:2308(workflow --http--> Bi-Studio),cs57:2306(superset --tcp--> Bi-Studio)
3. superset: cs19:7070

### 线上地址

1. TiDB: nb1188:5000, nb1191:5000, nb1194:5000
2. Bi-Studio apiserver: nb1188:2308(workflow --http--> Bi-Studio),nb1188:2306(superset --tcp--> Bi-Studio)
3. superset: nb1188:8080

## API文档

[API文档地址](https://github.com/qbox/report/blob/develop/TiDB/API-SPEC.md)

## superset的多租户

### 如何登录

superset本身有账户系统，需要和七牛的账户系统对接上。

superset通过OAuth2的方式连接到七牛系统。

### 多租户的实现原理

在superset本身的元数据管理方式上，增加了一个qiniu uid字段，根据oauth登录拿到的uid进行数据的操作。

## TiDB多租户

1. 以数据库为单位，一个用户可以根据业务的不同创建多个数据库

2. 原生的TiDB是直接用mysql协议来进行各种操作的，比如资源创建、数据写入、数据查询等。

我们不能直接沿用mysql协议，因为没有办法使用当前的这套鉴权系统，所以需要使用熟悉的http协议，在apiserver的内部进行转化。

3. 每个数据库以`用户APPID_`开头

4. 每个用户在第一次使用的时候，会被系统生成一个以用户appid为用户名的账户，密码是随机生成的，这个用户名和密码可以用作apiserver和superset连接TiDB的依据。


## superset和TiDB的连接

### 怎么连接

1. superset通过http协议连接Pandora TiDB进行元数据的管理
2. superset通过tcp协议连接Pandora TiDB进行数据的读取

### 如何鉴权

通过ak，sk鉴权

## biserver和TiDB的连接

### 怎么连接

1. biserver通过http协议连接TiDB进行元数据的管理
2. 离线导出和实时导出通过tcp协议连接TiDB进行打点操作

### 如何鉴权

1. 元数据管理通过ak sk鉴权
2. 打点操作通过多租户生成的用户名和密码鉴权


## 开发环境搭建

### superset环境搭建

1. 依照这个文档[安装superset](https://superset.incubator.apache.org/installation.html)进行安装，直到`superset runserver`这一步执行成功。

2. 替换superset和flask appbuilder，进入上一步安装成功的superset目录，克隆https://gitlab.qiniu.io/mengjinglei/superset.git 覆盖相应目录

3. 执行`superset runserver`，开发环境既可工作。

注意，开发环境和staging环境共用一套元数据，在本地开发环境添加数据库，数据表和报表会同步到staging环境。

### biserver环境搭建

直接clone本repo即可