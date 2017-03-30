package errors

import (
	"fmt"

	"github.com/qiniu/http/httputil.v1"
)

const (
	// Detailed error messages
	MARSHAL_JSON_FAILED_MESSAGE           = "Failed to marshal json string into corresponding type instance"
	UNMARSHAL_JSON_FAILED_MESSAGE         = "Failed to unmarshal type instance into corresponding json string"
	MATCH_PATTERN_FAILED_MESSAGE          = "Failed to match a regular expression pattern"
	CREATE_REQUEST_FAILED_MESSAGE         = "Failed to create a http request instance"
	REGISTER_SCHEMA_FAILED_MESSAGE        = "Failed to register a schema into schema segistry service"
	POST_RECORD_FAILED_MESSAGE            = "Failed to post records into kafka storage"
	FETCH_RESPONSE_ENTITY_FAILED_MESSAGE  = "Failed to fetch response entity"
	FETCH_REQUEST_ENTITY_FAILED_MESSAGE   = "Failed to fetch request entity"
	UPDATE_REGISTRY_CONFIG_FAILED_MESSAGE = "Failed to update schema registry compatibility level to NONE"
	POST_SCHED_EVNET_FAILED_MESSAGE       = "Failed to post event to scheduler"

	ErrInvalidDataSourceName = "The specified datasource name is not valid"
)

var (
	// General errors
	ErrInternalError = httputil.NewError(500, "E5100: Internal server error")

	ErrorPostDataSource = func(err error) *httputil.ErrorInfo {
		return httputil.NewError(400, fmt.Sprintf("E4211: Post DataSource Failed : %s", err.Error()))
	}

	ErrorShowTables = func(err error) *httputil.ErrorInfo {
		return httputil.NewError(400, fmt.Sprintf("E4212: Show table Failed : %s", err.Error()))
	}

	ErrorLoadTableData = func(err error) *httputil.ErrorInfo {
		return httputil.NewError(400, fmt.Sprintf("E4213: Load table data Failed : %s", err.Error()))
	}

	ErrorTestDataSource = func(err error) *httputil.ErrorInfo {
		return httputil.NewError(400, fmt.Sprintf("E4214: Test DataSource Failed : %s", err.Error()))
	}

	ErrorPostDataSet = func(err error) *httputil.ErrorInfo {
		return httputil.NewError(400, fmt.Sprintf("E4221: Post DataSet Failed : %s", err.Error()))
	}

	ErrorPostCode = func(err error) *httputil.ErrorInfo {
		return httputil.NewError(400, fmt.Sprintf("E4202: Post Code Failed : %s", err.Error()))
	}

	ErrorPostDir = func(err error) *httputil.ErrorInfo {
		return httputil.NewError(400, fmt.Sprintf("E4203: Post Dir Failed : %s", err.Error()))
	}

	ErrorPostReport = func(err error) *httputil.ErrorInfo {
		return httputil.NewError(400, fmt.Sprintf("E4204: Post Report Failed : %s", err.Error()))
	}
	ErrorPostChart = func(err error) *httputil.ErrorInfo {
		return httputil.NewError(400, fmt.Sprintf("E4205: Post Chart Failed : %s", err.Error()))
	}
	ErrorPostLayout = func(err error) *httputil.ErrorInfo {
		return httputil.NewError(400, fmt.Sprintf("E4206: Post Layout Failed : %s", err.Error()))
	}

	ErrPostTemplate = func(err error) *httputil.ErrorInfo {
		return httputil.NewError(400, fmt.Sprintf("E4501: Post Template Failed : %s", err.Error()))
	}

	ErrPostCronTask = func(err error) *httputil.ErrorInfo {
		return httputil.NewError(400, fmt.Sprintf("E4601: Post CronTask Failed : %s", err.Error()))
	}

	ErrNONEXISTENT_MESSAGE = func(err error, mgs interface{}) *httputil.ErrorInfo {
		return httputil.NewError(404, fmt.Sprintf("E4301: %v", mgs))
	}

	ErrQueryDatas = func(err error, mgs interface{}) *httputil.ErrorInfo {
		return httputil.NewError(404, fmt.Sprintf("E4401: %v", mgs))
	}
)
