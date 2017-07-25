package biserver

import (
	"fmt"

	"github.com/qiniu/http/rpcutil.v1"
	"qbox.us/errors"
)

const (
	X_APPID = "X-Appid"
)

func getAppidAndDBName(args *cmdArgs, env *rpcutil.Env) (appId, dbName string, err error) {
	appId = env.Req.Header.Get(X_APPID)
	if appId == "" {
		err = errors.Info(ErrHeaderAppIdError)
		return
	}

	dbName = args.CmdArgs[0]
	if dbName == "" {
		err = errors.Info(ErrDBNameInvalidError)
	}

	return
}

func constructUserDBName(appid, dbName string) string {
	return fmt.Sprintf("%s_%s", appid, dbName)
}

func getCreateUserDBSQL(dbName string) string {
	return fmt.Sprintf("CREATE DATABASE %s", dbName)
}
