package biserver

import "github.com/qiniu/http/httputil.v1"

var (
	ErrHeaderAppIdError   = httputil.NewError(400, "E7001: The Appid in request header is excepted to be a number!")
	ErrDBNameInvalidError = httputil.NewError(400, "E7002: DB name is invalid")
)
