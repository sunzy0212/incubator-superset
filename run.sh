#!/bin/bash

while true
do
sleep 1s
done

nohup /tidb/bin/pd-server --data-dir=/tidb/data/pd --log-file=pd.log 2>&1 &
sleep 2s
nohup /tidb/bin/tikv-server --pd='127.0.0.1:2379' --data-dir=/tidb/data/tikv --log-file=tikv.log 2>&1 &
sleep 2s
/tidb/bin/tidb-server --store=tikv --path="127.0.0.1:2379" --log-file=tidb.log