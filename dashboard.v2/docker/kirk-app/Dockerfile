FROM ubuntu:16.04
MAINTAINER CHENXIN WEN "wenchenxin@qiniu.com"
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN mkdir -p /apps
COPY build /apps
COPY bootstrap.sh /
RUN chmod a+x /bootstrap.sh
EXPOSE 8080
WORKDIR /apps
ENTRYPOINT ["/bin/bash","-c","/bootstrap.sh"]
