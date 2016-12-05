path=`pwd`
make
rm dist/reportd
cd src/qiniu.com/report/; CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -o ../../../dist/reportd
cd $path;docker build --rm --no-cache=true -t report:latest .
#kirk images push report

