FROM ubuntu:14.04

MAINTAINER zhangxin <zhangxin@qiniu.com>

RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

WORKDIR /app

ADD ./bin/entry_point /app/

ENV PANDORA_EMAIL_USER="pandora-monitor@qiniu.com"
ENV PANDORA_EMAIL_PASSWORD="7niuPandora"
ENV PANDORA_EMAIL_SERVER_ADDR="smtp.exmail.qq.com"
ENV PANDORA_EMAIL_SERVER_ADDR_PORT=465


ENTRYPOINT ["/app/entry_point"]