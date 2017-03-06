package rest

import (
	"testing"
)

var urls = []string{"http://localhost:8047"}

var handler = NewDrillClient(urls)

func TestGetStorages(t *testing.T) {
	ret, err := handler.GetStorages()
	if err != nil {
		t.Fatal(err)
	}
	t.Log(ret)
}

func TestPostStorage(t *testing.T) {
	s := Storage{
		Name: "test",
		Config: StorageConfig{
			Type:       "file",
			Enabled:    true,
			Connection: "classpath:///",
			Workspaces: map[string]interface{}{},
			//Formats:    map[string]interface{}{},
		},
	}
	ret, err := handler.PostStorage(s)
	if err != nil {
		t.Fatal(err)
	}
	t.Log(ret)
}

func TestPostStorageMySQL(t *testing.T) {
	s := Storage{
		Name: "mysql1",
		Config: StorageConfig{
			Type:     "jdbc",
			Enabled:  true,
			Driver:   "com.mysql.jdbc.Driver",
			Url:      "jdbc:mysql://localhost:3306",
			Username: "test1",
			Password: "",
		},
	}
	ret, err := handler.PostStorage(s)
	if err != nil {
		t.Fatal(err)
	}
	t.Log(ret.Result)
}

func TestGetStorage(t *testing.T) {
	ret, err := handler.GetStorage("mysql1")
	if err != nil {
		t.Fatal(err)
	}
	t.Log(ret)
}

func TestPostQuery(t *testing.T) {
	ret, err := handler.Query("SELECT * FROM cp.`employee.json` LIMIT 2")
	if err != nil {
		t.Fatal(err)
	}
	t.Log(ret)
}

func TestGetProfiles(t *testing.T) {
	ret, err := handler.GetProfiles()
	if err != nil {
		t.Fatal(err)
	}
	t.Log(ret)
}

//2742fcec-8502-26dc-e549-3b1f21ee8965
func TestGetProfile(t *testing.T) {
	ret, err := handler.GetProfile("2742fcec-8502-26dc-e549-3b1f21ee8965")
	if err != nil {
		t.Fatal(err)
	}
	t.Log(ret)
}

func TestCancelQuery(t *testing.T) {
	ret, err := handler.CancelQuery("2742fcec-8502-26dc-e549-3b1f21ee8965")
	if err != nil {
		t.Fatal(err)
	}
	t.Log(ret)
}
