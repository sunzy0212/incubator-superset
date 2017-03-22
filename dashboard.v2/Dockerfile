FROM ubuntu:16.04
MAINTAINER CHENXIN WEN "wenchenxin@qiniu.com"

#RUN echo "deb http://archive.ubuntu.com/ubuntu trusty main universe\n" > /etc/apt/sources.list && \
#	echo "deb http://archive.ubuntu.com/ubuntu trusty-updates main universe\n" >> /etc/apt/sources.list

#RUN apt-get update && apt-get install -y mongodb
RUN apt-get update && \
    apt-get -y --no-install-recommends install curl ca-certificates  && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    curl http://7xqd3r.com1.z0.glb.clouddn.com/authproxy/authproxy.2016.08.linux-amd64.tar.gz > /tmp/authproxy.tar.gz && \
    cd /tmp/ && \
    tar zxvf authproxy.tar.gz && \
    mkdir -p /authproxy && \
    mv _package/authproxy /authproxy && \
	rm -rf /tmp/* && \
	mkdir -p /report

COPY qiniu-cas.yml /authproxy/
COPY dist /report
COPY start-all.sh /

RUN chmod a+x /start-all.sh
EXPOSE 8001
WORKDIR /report
ENTRYPOINT ["/bin/bash","-c","/start-all.sh"]

