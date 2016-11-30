package main

import (
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/qiniu/db/mgoutil.v3"
	//"github.com/qiniu/errors"
	"github.com/qiniu/http/restrpc.v1"
	"github.com/qiniu/log.v1"
	"qbox.us/cc/config"
	"qiniu.com/report/common"
)

const (
	DEFAULT_DIAL_TIMEOUT        = "10s"
	DEFAULT_RESP_HEADER_TIMEOUT = "10s"
)

type MyServerMux struct {
	restrpc.ServeMux
}

type EndPoint struct {
	Port       string `json:"port"`
	MaxProcs   int    `json:"max_procs"`
	DebugLevel int    `json:"debug_level"`
	StaticPath string `json:"static_file_path"`
}

type Config struct {
	M mgoutil.Config `json:"mgo"`
	S EndPoint       `json:"service"`
}

func (self *MyServerMux) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	if origin := r.Header.Get("Origin"); origin != "" {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers",
			"Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
	}

	if r.Method == "OPTIONS" {
		return
	}

	self.ServeMux.ServeHTTP(w, r)
}

func NewServeMux() *MyServerMux {
	return new(MyServerMux)
}

func main() {

	config.Init("f", "report", "report.conf")
	var cfg Config
	if err := config.Load(&cfg); err != nil {
		log.Fatal("Load report config file failed:", err)
		return
	}
	log.SetOutputLevel(cfg.S.DebugLevel)
	if cfg.S.MaxProcs > runtime.NumCPU() || cfg.S.MaxProcs <= 0 {
		runtime.GOMAXPROCS(runtime.NumCPU()/2 + 1)
	} else {
		runtime.GOMAXPROCS(cfg.S.MaxProcs)
	}

	var colls common.Collections
	session, err := mgoutil.Open(&colls, &cfg.M)
	if err != nil {
		log.Fatal("Open mongodb failed:", err)
		return
	}
	colls.EnsureIndex()
	go func() {
		session.SetSocketTimeout(time.Second * 5)
		session.SetSyncTimeout(time.Second * 5)
		for {
			err := session.Ping()
			if err != nil {
				session.Refresh()
				session.SetSocketTimeout(time.Second * 5)
				session.SetSyncTimeout(time.Second * 5)
			} else {
				time.Sleep(time.Second * 5)
			}
		}
	}()

	srv, err := NewService(colls)
	if err != nil {
		defer session.Close()
		log.Fatal("Initialize portal service failed:", err)
	}

	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, os.Interrupt, os.Kill, syscall.SIGTERM)
	go func() {
		<-sigs
		session.Close()
		os.Exit(0)
	}()

	router := restrpc.Router{
		Factory:       restrpc.Factory,
		PatternPrefix: "/v1",
		Mux:           NewServeMux(),
	}

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir(cfg.S.StaticPath)))
	router.Mux.SetDefault(mux)
	log.Infof("listening on :%s", cfg.S.Port)
	log.Fatal(http.ListenAndServe(cfg.S.Port, router.Register(srv)))
}
