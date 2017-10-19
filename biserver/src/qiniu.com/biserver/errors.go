package biserver

import (
	"strings"

	"github.com/qiniu/http/httputil.v1"
)

var (
	ErrHeaderAppIdError      = httputil.NewError(400, "E8001: The Appid in request header is excepted to be a number!")
	ErrDBNameInvalidError    = httputil.NewError(400, "E8002: DB name is invalid")
	ErrInvalidSqlError       = httputil.NewError(400, "E8003: invalid sql")
	ErrInternalServerError   = httputil.NewError(599, "E8008: Server Internal Error")
	ErrInvalidAppIdError     = httputil.NewError(400, "E8004: you should activate this user first before create resource")
	ErrInvalidParameterError = httputil.NewError(400, "E8005: invalid parameters")
	ErrDBNotFoundError       = httputil.NewError(400, "E8006: database not found")
	ErrTableNotFoundError    = httputil.NewError(400, "E8007: Table not found")
	ErrDatabaseExistsError   = httputil.NewError(409, "E8009: database already exists")
	ErrTableExistsError      = httputil.NewError(409, "E8010: table already exists")
)

func translateMysqlError(src error) (dst error) {
	errStr := strings.Split(src.Error(), ":")
	switch errStr[0] {
	case "Error 1007":
		return ErrDatabaseExistsError
	case "Error 1008":
		return ErrDBNotFoundError
	case "Error 1050":
		return ErrTableExistsError
	case "Error 1051":
		return ErrTableNotFoundError
	}
	return src
}
