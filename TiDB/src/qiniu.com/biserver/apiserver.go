package biserver

import (
	"fmt"

	"github.com/XeLabs/go-mysqlstack/driver"
	"github.com/XeLabs/go-mysqlstack/xlog"
)

type ApiServerConfig struct {
	TcpAddress string
}

type ApiServer struct {
	Listener driver.Listener
}

func New(cfg *ApiServerConfig) (*ApiServer, error) {
	server := &ApiServer{}

	log := xlog.NewStdLog(xlog.Level(xlog.ERROR))
	handler := driver.NewTestHandler(log)
	listener, err := driver.NewListener(log, cfg.TcpAddress, handler)
	if err != nil {
		return nil, err
	}
	server.Listener = *listener
	return server, nil
}

func (s *ApiServer) Accept() {
	fmt.Println("start to Accept")
	s.Listener.Accept()
	fmt.Println("accept closed")
}
