FROM ubuntu:16.04
MAINTAINER CHENXIN WEN "wenchenxin@qiniu.com"

RUN echo "deb http://archive.ubuntu.com/ubuntu trusty main universe\n" > /etc/apt/sources.list && \
    echo "deb http://archive.ubuntu.com/ubuntu trusty-updates main universe\n" >> /etc/apt/sources.list

RUN apt-get update && apt-get install -y python-setuptools && easy_install pip && pip install flask
