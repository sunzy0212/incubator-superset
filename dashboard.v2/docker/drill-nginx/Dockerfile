FROM library/nginx:stable
MAINTAINER CHENXIN WEN "wenchenxin@qiniu.com"
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN mkdir -p /data/logs && \
	apt-get update && \
	apt-get install -y curl

ADD nginx.conf /etc/nginx/nginx.conf
ADD .htpasswd /etc/nginx/.htpasswd
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
