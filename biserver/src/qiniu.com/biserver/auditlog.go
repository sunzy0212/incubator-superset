package biserver

import (
	"bytes"
	"net/http"
	"strings"

	"github.com/qiniu/bytes/seekable"
	"github.com/qiniu/errors"
	"github.com/qiniu/http/audit/jsonlog"
	. "github.com/qiniu/http/audit/proto"
	"github.com/qiniu/http/supervisor"
	"github.com/qiniu/largefile/log"
	qlog "github.com/qiniu/log.v1"
	"qbox.us/servend/account"
	"qbox.us/servend/proxy_auth"
)

// ----------------------------------------------------------

type decoder struct {
	jsonlog.BaseDecoder
	account.AuthParser
}

func (r *decoder) DecodeRequest(req *http.Request) (url string, header, params M) {

	url, header, params = r.BaseDecoder.DecodeRequest(req)
	user, err := r.ParseAuth(req)
	if err != nil {
		return
	}

	token := M{
		"uid":   user.Uid,
		"utype": user.Utype,
	}
	if user.UtypeSu != 0 {
		token["sudoer"] = user.Sudoer
		token["utypesu"] = user.UtypeSu
	}
	if user.Appid != 0 {
		token["appid"] = user.Appid
	}
	if user.Devid != 0 {
		token["devid"] = user.Devid
	}
	header["Token"] = token
	return
}

// --------------------------------------------------------------------

type authProxy struct {
	p account.AuthParser
}

func (r authProxy) ParseAuth(req *http.Request) (user account.UserInfo, err error) {

	user, err = r.p.ParseAuth(req)
	if err == nil {
		req.Header.Set("Authorization", proxy_auth.MakeAuth(user))
	} else {
		req.Header.Del("Authorization") // 很重要：避免外界也可以发 proxy auth
	}
	return
}

// --------------------------------------------------------------------

type AuditlogConfig struct {
	Supervisor supervisor.Config `json:"supervisor"`
	LogFile    string            `json:"logdir"`
	ChunkBits  uint              `json:"chunkbits"`
	NoXlog     uint              `json:"noxlog"`
	BodyLimit  int               `json:"bodylimit"`
	AuthProxy  int               `json:"-"`
}

func Open(module string, cfg *AuditlogConfig, dec jsonlog.Decoder, acc account.AuthParser) (al *jsonlog.Logger, logf *log.Logger, err error) {

	if cfg.BodyLimit == 0 {
		cfg.BodyLimit = 1024
	}

	logf, err = log.Open(cfg.LogFile, cfg.ChunkBits)
	if err != nil {
		err = errors.Info(err, "jsonlog.Open: largefile/log.Open failed").Detail(err)
		return
	}

	//var dec jsonlog.Decoder
	if acc != nil {
		if cfg.AuthProxy != 0 {
			acc = authProxy{acc}
		}
		dec = &decoder{AuthParser: acc}
	}
	al = jsonlog.NewEx(module, logf, dec, cfg.BodyLimit, cfg.NoXlog == 0)
	if cfg.Supervisor.BindHost != "" {
		spv := supervisor.New()
		al.SetEvent(spv)
		go func() {
			err := spv.ListenAndServe(&cfg.Supervisor)
			if err != nil {
				qlog.Error("jsonlog supervisor listenAndServe failed:", cfg.Supervisor.BindHost, err)
			}
		}()
	}
	return
}

// ----------------------------------------------------------

type PointdDecoder struct {
}

func set(h M, header http.Header, key string) {
	if v, ok := header[key]; ok {
		h[key] = v[0]
	}
}

func ip(addr string) string {
	pos := strings.Index(addr, ":")
	if pos < 0 {
		return addr
	}
	return addr[:pos]
}

func queryToJson(m map[string][]string) (h M, err error) {

	h = make(M)
	for k, v := range m {
		if len(v) == 1 {
			h[k] = v[0]
		} else {
			h[k] = v
		}
	}
	return
}

func (r PointdDecoder) DecodeRequest(req *http.Request) (url_ string, h, params M) {

	h = M{"IP": ip(req.RemoteAddr), "Host": req.Host}
	ct, ok := req.Header["Content-Type"]
	if ok {
		h["Content-Type"] = ct[0]
	}
	if req.URL.RawQuery != "" {
		h["RawQuery"] = req.URL.RawQuery
	}

	set(h, req.Header, "User-Agent")
	set(h, req.Header, "Range")
	set(h, req.Header, "Refer")
	set(h, req.Header, "Content-Length")
	set(h, req.Header, "If-None-Match")
	set(h, req.Header, "If-Modified-Since")
	set(h, req.Header, "X-Real-Ip")
	set(h, req.Header, "X-Forwarded-For")
	set(h, req.Header, "X-Scheme")
	set(h, req.Header, "X-Remote-Ip")
	set(h, req.Header, "X-Reqid")
	set(h, req.Header, "X-Id")
	set(h, req.Header, "X-From-Cdn")
	set(h, req.Header, "X-Tencent-Ua")
	set(h, req.Header, "X-From-Proxy-Getter")
	set(h, req.Header, "X-From-Qnm")
	set(h, req.Header, "Cdn-Src-Ip")
	set(h, req.Header, "Cdn-Scheme")
	set(h, req.Header, "X-Upload-Encoding")
	set(h, req.Header, "Accept-Encoding")

	url_ = req.URL.Path
	if ok {
		switch ct[0] {
		case "application/x-www-form-urlencoded":
			seekable, err := seekable.New(req)
			if err == nil {
				req.ParseForm()
				params, _ = queryToJson(req.Form)
				seekable.SeekToBegin()
			}
		}
	}
	if params == nil {
		params = make(M)
	}
	return
}

func (r PointdDecoder) DecodeResponse(header http.Header, bodyThumb []byte, h, params M) (resph M, body []byte) {

	if h == nil {
		h = make(M)
	}

	ct, ok := header["Content-Type"]
	if ok {
		h["Content-Type"] = ct[0]
	}
	if xlog, ok := header["X-Log"]; ok {
		h["X-Log"] = xlog
	}
	set(h, header, "X-Reqid")
	set(h, header, "X-Id")
	set(h, header, "X-Qnm-Cache")
	set(h, header, "Content-Length")
	set(h, header, "Content-Encoding")
	set(h, header, "X-Qiniu-Root-Cause")
	set(h, header, "X-Batch-Size")
	set(h, header, "X-Points-Total")
	set(h, header, "X-Illegal-Count")
	set(h, header, "X-Legal-Count")
	set(h, header, "X-Appid")
	set(h, header, "X-Reponame")
	set(h, header, "X-Operation")
	set(h, header, "X-Req-Body-Length")
	set(h, header, "X-Sql-Complexity")
	set(h, header, "X-Sql-Scanned-Bytes")

	if ok && ct[0] == "application/json" && header.Get("Content-Encoding") != "gzip" {
		if -1 == bytes.IndexAny(bodyThumb, "\n\r") {
			body = bodyThumb
		}
	}
	resph = h
	return
}
