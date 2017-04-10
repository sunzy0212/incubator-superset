all: report
report:
	rm -rf dist && rm -rf front/dist && mkdir dist
	cd dist; openssl genrsa -out key.pem 2048
	cd dist; openssl req -new -x509 -key key.pem -out cert.pem -days 3650
	cd src/qiniu.com/report/; CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -o ../../../dist/reportd
	cp src/qiniu.com/report/report.conf dist/
	cd front; npm install && npm run build
	cp front/dist/* dist/
	cp -r front/src/assets dist/
	
apps:
	cd agent; yarn install && yarn run build
	cd agent/build; mkdir templates; mv index.html templates
	cd src/qiniu.com/agent/;CC=x86_64-pc-linux-gcc CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -v  -o ../../../agent/build/appd -ldflags="-extld=$CC"

install: apps report
	@echo

test:
	cd src; CGO_ENABLED=1 go test -cover ./...

clean:
	cd src; go clean -i ./...

style:
	@$(QCHECKSTYLE) src

gofmt:
	find . -name '*.go' | xargs -l1 go fmt

testaone:
	#cd src; CGO_ENABLED=1 curl https://aone.qiniu.io/api/coverage/collect?token=A59B8029-E9A1-4FF3-B72B-3657CEAC64D4 | bash
