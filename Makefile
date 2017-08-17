### Makefile for tidb

GOPATH ?= $(shell go env GOPATH)

# Ensure GOPATH is set before running build process.
ifeq "$(GOPATH)" ""
  $(error Please set the environment variable GOPATH before running `make`)
endif

CURDIR := $(shell pwd)
path_to_add := $(addsuffix /bin,$(subst :,/bin:,$(CURDIR)/_vendor:$(GOPATH)))
export PATH := $(path_to_add):$(PATH)

GO        := go
GOBUILD   := GOPATH=$(CURDIR)/_vendor:$(GOPATH) CGO_ENABLED=0 $(GO) build
GOTEST    := GOPATH=$(CURDIR)/_vendor:$(GOPATH) CGO_ENABLED=1 $(GO) test
OVERALLS  := GOPATH=$(CURDIR)/_vendor:$(GOPATH) CGO_ENABLED=1 overalls
GOVERALLS := goveralls

ARCH      := "`uname -s`"
LINUX     := "Linux"
MAC       := "Darwin"
PACKAGES  := $(CURDIR)/TiDB/src/qiniu.com/biserver
FILES     := $$(find . -name '*.go' | grep -vE 'vendor')

LDFLAGS += -X "github.com/pingcap/tidb/util/printer.TiDBBuildTS=$(shell date -u '+%Y-%m-%d %I:%M:%S')"
LDFLAGS += -X "github.com/pingcap/tidb/util/printer.TiDBGitHash=$(shell git rev-parse HEAD)"

TARGET = ""

.PHONY: all build update parser clean todo test gotest interpreter server dev benchkv benchraw check parserlib checklist

default: server buildsucc

buildsucc:
	@echo Build TiDB Server successfully!

all: server

build:
	$(GOBUILD)

TEMP_FILE = temp_parser_file


clean:
	$(GO) clean -i ./...
	rm -rf *.out

test: gotest

gotest:
	@echo "Running in native mode."
	cd $(PACKAGES);$(GOTEST) ./...

server:
ifeq ($(TARGET), "")
	$(GOBUILD) $(RACE_FLAG) -ldflags '$(LDFLAGS)' -o bin/tidb-server TiDB/tidb-server/main.go
else
	$(GOBUILD) $(RACE_FLAG) -ldflags '$(LDFLAGS)' -o '$(TARGET)' TiDB/tidb-server/main.go
endif

biserver:
ifeq ($(TARGET), "")
	$(GOBUILD) $(RACE_FLAG) -ldflags '$(LDFLAGS)' -o bin/pandora-biserver TiDB/cmd/apiserver/main.go
else
	$(GOBUILD) $(RACE_FLAG) -ldflags '$(LDFLAGS)' -o '$(TARGET)' TiDB/cmd/apiserver/main.go
endif