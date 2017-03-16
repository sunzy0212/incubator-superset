package data

var OP = map[string]string{
	"NIN":  "NOT IN",
	"IN":   "IN",
	"EQ":   "=",
	"NQ":   "<>",
	"GT":   ">",
	"LT":   "<",
	"GE":   ">=",
	"LE":   "<=",
	"LIKE": "like",
}

type SourceType int32

const (
	FIELD_TYPE_STRING    = "string"
	FIELD_TYPE_NUMBER    = "number"
	FIELD_TYPE_TIMESTAMP = "timestamp"
)
