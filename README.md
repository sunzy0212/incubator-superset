# 七牛BI Studio

superset -> TiDB

其中superset作为展示层，TiDB作为数据存储层，需要注意的是TiDB并不是作为RDS的存在，仅仅是superset的后端。

## superset的多租户

### 如何登录

superset本身有账户系统，需要和七牛的账户系统对接上。

superset通过OAuth2的方式连接到七牛系统。

### 怎么多租户

首先superset的数据管理方式是这样的

1. 在配置文件中指定一个MYSQL的uri和数据库，用来存放各种用户的元数据
2. 在添加数据源的时候，可以指定不同的MYSQL地址和数据库

解决多租户的方式为

1. 每个注册用户都有一个自己的MYSQL数据库

这个数据库用来存放各种元数据，比如权限信息，dashboard信息，数据源信息等
在用户登录进去superset之后，连接的数据库需要自动连接对应用户的数据库，比如以用户uid命名的数据库.

具体实现方式

flask-appbuilder的构造函数是这样的

```
  def __init__(self, app=None,
                 session=None,
                 menu=None,
                 indexview=None,
                 base_template='appbuilder/baselayout.html',
                 static_folder='static/appbuilder',
                 static_url_path='/appbuilder',
                 security_manager_class=None):

```

app: 是一个Flask app
session： 是一个sqlalchemy的DB_Session对象

```
DB_CONNECT_STRING = 'mysql+mysqldb://100.100.32.234:3306/sqlalchemy1?charset=utf8'
engine = create_engine(DB_CONNECT_STRING, echo=True)
DB_Session = sessionmaker(bind=engine)
session = DB_Session()
```

这个session是和database绑定的，一旦创建就不能修改database

为了实现多租户，需要在superset内部维护一个uid到session的映射关系
每当用户登录之后，创建一个session，在登录期间进行的所有操作都用这个session来进行；
每当用户登出之后，销毁这个session；

2. 自动添加用户相关的数据源，在打开添加数据源页面的时候，自动请求后端，拿到对应的数据源，不允许用户自定义添加



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