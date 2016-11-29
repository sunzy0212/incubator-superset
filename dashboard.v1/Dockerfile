FROM ubuntu:16.04
MAINTAINER CHENXIN WEN "wenchenxin@qiniu.com"

#RUN echo "deb http://archive.ubuntu.com/ubuntu trusty main universe\n" > /etc/apt/sources.list && \
#	echo "deb http://archive.ubuntu.com/ubuntu trusty-updates main universe\n" >> /etc/apt/sources.list

WORKDIR /app

RUN mkdir -p /app/report
COPY dist /app/report

EXPOSE 8000
WORKDIR /app/report
ENTRYPOINT ["./reportd"]

