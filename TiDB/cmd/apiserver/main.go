package main

import (
	"net/http"
	"runtime"

	_ "net/http/pprof"

	"github.com/qiniu/errors"
	"github.com/qiniu/http/restrpc.v1"
	"github.com/qiniu/http/servestk.v1"
	"github.com/qiniu/log.v1"
	"github.com/qiniu/xlog.v1"
	"qbox.us/cc/config"
	"qiniu.com/biserver"
	"qiniu.com/pandora/pandora.v4/auditlog"
	"qiniupkg.com/trace.v1"
)

type MysqlConfig struct {
	User     string `json:"user"`
	Password string `json:"password"`
	Protocol string `json:"protocol"`
	Address  string `json:"address"`
	MetaDB   string `json:"metadb"`
}

type EndPoint struct {
	Host       string `json:"host"`
	Region     string `json:"region"`
	Prefix     string `json:"prefix"`
	HttpPort   string `json:"http_port"`
	TcpPort    string `json:"tcp_port"`
	MaxProcs   int    `json:"max_procs"`
	DebugLevel int    `json:"debug_level"`
	PprofPort  string `json:"pprof_port"`
}

type Config struct {
	M MysqlConfig     `json:"mysql"`
	S EndPoint        `json:"service"`
	L auditlog.Config `json:"auditlog"`
}

func ensureRequiredConfig(cfg *Config) (err error) {

	return nil
}

func main() {

	config.Init("config", "report", "report-default.conf")

	var conf Config
	if err := config.Load(&conf); err != nil {
		log.Fatal("config.Load failed:", err)
	}
	log.SetOutputLevel(conf.S.DebugLevel)

	if err := ensureRequiredConfig(&conf); err != nil {
		log.Fatal(err)
	}

	runtime.GOMAXPROCS(conf.S.MaxProcs)

	go func() {
		if conf.S.PprofPort != "" {
			log.Error(http.ListenAndServe(conf.S.PprofPort, nil))
		} else {
			log.Info("pprof disabled!")
		}

	}()

	svr, err := biserver.New(&biserver.ApiServerConfig{TcpAddress: conf.S.TcpPort})
	if err != nil {
		log.Fatal(err)
	}

	go svr.Accept()

	al, logf, err := auditlog.Open("REPORT", &conf.L, auditlog.PointdDecoder{}, nil)
	if err != nil {
		log.Fatal("jsonlog.Open failed:", errors.Detail(err))
	}
	defer logf.Close()

	mux := trace.NewServeMuxWith(servestk.New(restrpc.NewServeMux(), requestLogger, al.Handler))

	router := restrpc.Router{
		Factory:       restrpc.Factory,
		PatternPrefix: "/v1",
		Mux:           mux,
	}

	err = http.ListenAndServe(conf.S.HttpPort, router.Register(svr))

	log.Fatal(err)
}

func requestLogger(w http.ResponseWriter, req *http.Request, f func(http.ResponseWriter, *http.Request)) {
	xlog.New(w, req)
	f(w, req)
}
