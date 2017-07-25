package biserver

type MysqlConfig struct {
	User     string `json:"user"`
	Password string `json:"password"`
	Protocol string `json:"protocol"`
	Address  string `json:"address"`
	MetaDB   string `json:"metadb"`
}

type Command struct {
	CMD string `json:"cmd"`
}
