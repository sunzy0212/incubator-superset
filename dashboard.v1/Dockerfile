FROM ubuntu:16.04
MAINTAINER CHENXIN WEN "wenchenxin@qiniu.com"

#RUN echo "deb http://archive.ubuntu.com/ubuntu trusty main universe\n" > /etc/apt/sources.list && \
#	echo "deb http://archive.ubuntu.com/ubuntu trusty-updates main universe\n" >> /etc/apt/sources.list

RUN apt-get update && apt-get install -y mongodb

WORKDIR /app

RUN mkdir -p /app/report
COPY dist /app/report
COPY start.sh /app/report

WORKDIR /app/report
RUN chmod a+x ./start.sh
EXPOSE 8000

ENTRYPOINT ["/bin/bash","-c","./start.sh"]

