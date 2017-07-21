FROM ubuntu:14.04

WORKDIR /tidb

COPY ./bin/pd-server /tidb/bin/pd-server
COPY ./bin/tikv-server /tidb/bin/tikv-server
COPY ./bin/tidb-server /tidb/bin/tidb-server
COPY ./run.sh /tidb/run.sh

ENTRYPOINT ["/tidb/run.sh"]
