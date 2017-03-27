package main

import (
	"fmt"
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

type Drill struct {
	Urls []string `json:"urls"`
}

type Env struct {
	Dev bool `json:"dev"`
}

type Config struct {
	E     Env            `json:"env"`
	M     mgoutil.Config `json:"mgo"`
	S     EndPoint       `json:"service"`
	Drill Drill          `json:"drill"`
}

func (self *MyServerMux) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	if origin := r.Header.Get("Origin"); origin != "" {
		w.Header().Set("Access-Control-Allow-Origin", "*")
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
		log.Warn("Load report config file failed\n Use default config:")
		cfg = Config{
			Env{Dev: false},
			mgoutil.Config{Host: "127.0.0.1", DB: "report"},
			EndPoint{"8000", runtime.NumCPU()/2 + 1, 1, "./"},
			Drill{
				Urls: []string{"http://localhost:8047"},
			},
		}
		log.Infof("%+v", cfg)
	}

	if os.Getenv("MONGO_HOST") != "" {
		cfg.M.Host = os.Getenv("MONGO_HOST")
	}
	if os.Getenv("MONGO_DB") != "" {
		cfg.M.DB = os.Getenv("MONGO_DB")
	}

	if os.Getenv("DRILL_HOST") != "" {
		cfg.Drill.Urls = []string{os.Getenv("DRILL_HOST")}
	}

	log.SetOutputLevel(cfg.S.DebugLevel)
	if cfg.S.MaxProcs > runtime.NumCPU() || cfg.S.MaxProcs <= 0 {
		runtime.GOMAXPROCS(runtime.NumCPU()/2 + 1)
	} else {
		runtime.GOMAXPROCS(cfg.S.MaxProcs)
	}

	var colls common.Collections
	session, err := mgoutil.Open(&colls, &cfg.M)

	for err != nil {
		log.Warnf("Open mongodb failed: %v", err)
		session, err = mgoutil.Open(&colls, &cfg.M)
		time.Sleep(time.Second * 1)
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

	srv, err := NewService(colls, cfg.Drill.Urls)
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
	if cfg.E.Dev {
		log.Infof("listening on :%s use http", cfg.S.Port)
		log.Fatal(http.ListenAndServe(fmt.Sprintf("0.0.0.0:%s", cfg.S.Port), router.Register(srv)))
	} else {
		log.Infof("listening on :%s use https", cfg.S.Port)
		log.Fatal(http.ListenAndServeTLS(fmt.Sprintf("0.0.0.0:%s", cfg.S.Port), "cert.pem", "key.pem", router.Register(srv)))
	}
}
