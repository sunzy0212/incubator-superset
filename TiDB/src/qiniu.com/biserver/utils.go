package biserver

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"strings"

	"database/sql"

	"github.com/XeLabs/go-mysqlstack/sqlparser/depends/sqltypes"
	garbler "github.com/michaelbironneau/garbler/lib"
	"github.com/qiniu/http/rpcutil.v1"
	"qbox.us/errors"
)

const (
	X_APPID = "X-Appid"
)

func generatePassword() (password string, err error) {
	reqs := garbler.PasswordStrengthRequirements{
		MinimumTotalLength: 20,
		Digits:             10,
	}
	p, err := garbler.NewPassword(&reqs)
	if err != nil {
		fmt.Println(err)
		return
	}
	return p, nil
}

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

func getSchemaAndValues(data []byte) (schema, values string, err error) {

	ds := strings.Split(string(data), "\n")
	if len(ds) < 2 {
		err = fmt.Errorf("invalid data format", len(ds))
		return
	}

	schema = string(ds[0])
	schemaLength := len(strings.Split(schema, ","))
	ds = ds[1:]
	for _, d := range ds {
		line := strings.Split(string(d), ",")
		if len(line) != schemaLength {
			err = fmt.Errorf("value '%s' not match schema '%s'", string(d), schema)
			return
		}
		values += fmt.Sprintf("(%s),", string(d))
	}
	values = values[:len(values)-1]

	return
}

func getDBByAppID(client *sql.DB, metadb, appid string) (dbs []string, err error) {

	selectDBName, err := client.Prepare(fmt.Sprintf("SELECT dbname from %s.dbs where appid= '%s'", metadb, appid))
	if err != nil {
		return
	}

	result, err := selectDBName.Query()
	if err != nil {
		return
	}

	dbs = make([]string, 0)
	var dbName string
	for result.Next() {
		result.Scan(&dbName)
		dbs = append(dbs, dbName)
	}
	return
}

func convertResult(result *sqltypes.Result) QueryRet {
	ret := QueryRet{
		Results: []Result{
			{},
		},
	}

	columns := make([]string, 0)
	for _, field := range result.Fields {
		columns = append(columns, field.Name)
	}
	fmt.Println(columns)
	fmt.Println(result.Rows)
	ret.Results[0].Columns = columns
	ret.Results[0].Rows = result.Rows

	return ret
}

func getEncryptPasswordForDB(secretKey, p string) (password string, err error) {
	h := sha256.New()
	h.Write([]byte(secretKey))
	secret := h.Sum(nil)

	//补齐16的倍数位
	padding := 16 - len(p)%16
	for i := 0; i < padding; i++ {
		p += "*"
	}

	pwd := []byte(p)
	block, err := aes.NewCipher(secret)
	if err != nil {
		return
	}
	iv := secret[:16]
	mode := cipher.NewCBCEncrypter(block, iv)
	ciphertext := make([]byte, len(pwd))
	mode.CryptBlocks(ciphertext, pwd)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}
