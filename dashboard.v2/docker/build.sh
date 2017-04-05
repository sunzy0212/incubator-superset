path=`pwd`
cd .. ; make apps
pwd
cp -r agent/build $path
cd $path; docker build --rm --no-cache=true -t report-apps:latest .
rm -rf build
kirk images push report-apps:latest

