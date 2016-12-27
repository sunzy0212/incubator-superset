#!/bin/bash -e

: "${GF_PATHS_PROXY_CONF:=/report/proxy_conf}"

mkdir -p "$GF_PATHS_PROXY_CONF"
cp /authproxy/qiniu-cas.yml "$GF_PATHS_PROXY_CONF"/qiniu-cas.yml
RANDOM_SECRET=`date +%s | sha256sum | base64 | head -c 32`
sed -i "s/RANDOM_SECRET/$RANDOM_SECRET/g" "$GF_PATHS_PROXY_CONF"/qiniu-cas.yml

/authproxy/authproxy -c "$GF_PATHS_PROXY_CONF"/qiniu-cas.yml &
./reportd
