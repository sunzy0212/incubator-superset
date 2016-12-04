path=`pwd`
rm -rf dist && mkdir dist
cp front/index.html dist/
cp start.sh dist/
cp -r front/static dist/
cd src/qiniu.com/report/; CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -o ../../../dist/reportd
cd $path;docker build --rm --no-cache=true -t report:latest .
#kirk images push report

