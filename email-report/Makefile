all: clean
	cd src/qiniu.com/email-report/;CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -v -a -o ../../../bin/email-report-v1 ./main/entry_point

clean:
	rm -rf bin
	mkdir bin