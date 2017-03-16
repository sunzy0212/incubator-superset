all:
	rm -rf dist && rm -rf front/dist && mkdir dist
	cd src/qiniu.com/report/; CGO_ENABLED=0 go build -a -o ../../../dist/reportd
	cp src/qiniu.com/report/report.conf dist/
	cd front; npm install && npm run build
	cp front/dist/* dist/
	cp -r front/src/assets dist/

install: all
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
