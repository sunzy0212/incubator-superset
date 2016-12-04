
mkdir -p /data/db/ && mongod --noprealloc --smallfiles > mongo.out 2>&1 &
sleep 10s

./reportd
