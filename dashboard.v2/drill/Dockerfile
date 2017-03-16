FROM centos

MAINTAINER wenchenxin@qiniu.com

#RUN yum install -y tar java-1.8.0-openjdk-devel && \
RUN mkdir -p /drill-scripts && \
    mkdir -p /opt/drill && \
	mkdir -p /opt/jdk8


ADD apache-drill-1.9.0 /opt/drill
ADD jdk1.8.0_121 /opt/jdk8
ADD bootstrap.sh /drill-scripts/bootstrap.sh
RUN chown root:root /drill-scripts/bootstrap.sh && \
    chmod 700 /drill-scripts/bootstrap.sh
ENV BOOTSTRAP /drill-scripts/bootstrap.sh
ENV JAVA_HOME /opt/jdk8
EXPOSE 8047
