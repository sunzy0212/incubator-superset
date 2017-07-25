package biserver

import (
	"fmt"

	"github.com/XeLabs/go-mysqlstack/driver"
	"github.com/XeLabs/go-mysqlstack/xlog"

	"github.com/qiniu/http/rpcutil.v1"
)

type ApiServerConfig struct {
	TcpAddress string
}

type ApiServer struct {
	Listener driver.Listener
}

func New(cfg *ApiServerConfig) (*ApiServer, error) {
	server := &ApiServer{}

	log := xlog.NewStdLog(xlog.Level(xlog.DEBUG))
	handler := NewTiDBHandler(log)
	listener, err := driver.NewListener(log, cfg.TcpAddress, handler)
	if err != nil {
		return nil, err
	}
	server.Listener = *listener
	return server, nil
}

//处理tcp发过来的查询请求，仅限superset端发送的请求
func (s *ApiServer) Accept() {
	fmt.Println("start to Accept")
	s.Listener.Accept()
	fmt.Println("accept closed")
}

type M map[string]interface{}

type cmdArgs struct {
	CmdArgs []string
}

// POST /v1/repos/<RepoName>/points?omitInvalidPoints=<true|false>
// Content-Type: text/plain
// X-Appid: <AppId>
func (s *ApiServer) PostRepos_Points(args *cmdArgs, env *rpcutil.Env) (err error) {

	return
}
