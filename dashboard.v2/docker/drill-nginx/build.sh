docker build --rm --no-cache=true -t drill-nginx:latest .
rm -rf build
kirk images push drill-nginx:latest

