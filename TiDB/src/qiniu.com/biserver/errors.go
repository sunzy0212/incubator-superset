package biserver

import "github.com/qiniu/http/httputil.v1"

var (
	ErrHeaderAppIdError      = httputil.NewError(400, "E8001: The Appid in request header is excepted to be a number!")
	ErrDBNameInvalidError    = httputil.NewError(400, "E8002: DB name is invalid")
	ErrInvalidSqlError       = httputil.NewError(400, "E8003: invalid sql")
	ErrInternalServerError   = httputil.NewError(599, "E9001: Server Internal Error")
	ErrInvalidAppIdError     = httputil.NewError(400, "E8004: you should activate this user first before create resource")
	ErrInvalidParameterError = httputil.NewError(400, "E8005: invalid parameters")
	ErrDBNotFoundError       = httputil.NewError(400, "E8006: database not found")
)
