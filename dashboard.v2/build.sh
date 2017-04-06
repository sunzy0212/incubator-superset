path=`pwd`
make report
#rm dist/reportd
#cd src/qiniu.com/report/; CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -o ../../../dist/reportd
cd $path; docker build --rm --no-cache=true -t report2:latest .
kirk images push report2:latest

#make apps
#cd $path/docker; docker build --rm --no-cache=true -t report-apps:latest .

