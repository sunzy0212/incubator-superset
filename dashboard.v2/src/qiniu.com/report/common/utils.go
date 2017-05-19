package common

import (
	"strings"
	"time"

	"github.com/qiniu/uuid"
)

const (
	DATE_FORMAT_BASELINE = "2006-01-02 15:04:05"
)

var (
	DateStringFormats = map[string]string{
		"yyyy-MM-dd":               "2006-01-02",
		"yyyy-MM-dd HH:mm:ss":      "2006-01-02 15:04:05",
		"yyyy-M-d":                 "2006-1-2",
		"yy-MM-dd":                 "06-01-02",
		"yyyy-MM":                  "2006-01",
		"yy-MM":                    "06-01",
		"yyyyMMdd":                 "20060102",
		"yyyyMMdd HHmmss":          "20060102 150405",
		"yyyy/MM/dd":               "2006/01/02",
		"yyyy/MM/dd HH:mm:ss":      "2006/01/02 15:04:05",
		"2006-01-02T15:04:05.999Z": "2006-01-02T15:04:05.999Z",
	}
)

//生成uuid
func GenId() (id string, err error) {
	id, err = uuid.Gen(12)
	for strings.ContainsAny(id, "_-") || (id[0] >= '0' && id[0] <= '9') {
		id, err = uuid.Gen(12)
	}
	return
}

//创建时间 (这个应该放在数据库服务器)
func GetCurrTime() (ct string) {
	ct = time.Now().Format(DATE_FORMAT_BASELINE)
	return ct
}

func ParseTime2String(t time.Time) string {
	return t.Format(DATE_FORMAT_BASELINE)
}

func ParseString2Time(ct string) (time.Time, error) {
	return time.Parse(DATE_FORMAT_BASELINE, ct)
}
