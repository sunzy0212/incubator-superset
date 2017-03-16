FROM ubuntu:16.04
MAINTAINER CHENXIN WEN "wenchenxin@qiniu.com"

#RUN echo "deb http://archive.ubuntu.com/ubuntu trusty main universe\n" > /etc/apt/sources.list && \
#	echo "deb http://archive.ubuntu.com/ubuntu trusty-updates main universe\n" >> /etc/apt/sources.list

#RUN apt-get update && apt-get install -y mongodb
RUN mkdir -p /report

COPY dist /report
COPY start.sh /

RUN chmod a+x /start.sh
EXPOSE 8001
WORKDIR /report
ENTRYPOINT ["/bin/bash","-c","/start.sh"]

