Dashboard V1

## 使用指南



### 设置 influxDB Host 与 密码

![](https://ocif40xit.qnssl.com/dashboard02.png)

![](https://ocif40xit.qnssl.com/Dashboard03.png)

###  Editor 使用说明



![](https://ocif40xit.qnssl.com/Dashboard00.png)



### Dashboard 使用说明



![](https://ocif40xit.qnssl.com/Dashboard01.png)



 ## 部署





1 . 纯前端静态文件部署 （v1）

  只需要 Nginx 静态服务 /front/static 路径下的文件即可。

  用户在登陆网页后，需要手动设置数据源的host（必选），LDAP 验证(可选)

```

 ______		   	 _____________      	_________
|	   | LDAP 	|	Dashboard | LDAP    |		 |
| User |  --->  |    Front    |	----> 	|  Data  | 
|______|	  	|_____________|	    	|________|
```



2 . 前后端版本

在拥有纯静态全功能的同时，拥有多租户功能，可以云端同步 图标的布局，每个用户有独立的搜索记录，收藏云端存储功能。

```
pip install -r back/requirements.txt
python manage.py runserver 0.0.0.0:8080
```

​

## 前端开发

```
cd front
npm install 
npm run watch  		# 开发 debug 用
npm run build  		# 构建发布版本
cd front/static  	# 可获得构件好的静态文件
```

