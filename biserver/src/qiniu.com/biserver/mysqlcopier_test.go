package biserver

import (
	"testing"

	"github.com/mengjinglei/ferry/mysql"
)

func test_copyTables(t *testing.T) {
	src := &mysql.Config{
		Host:     "10.200.20.39",
		Port:     "5000",
		Database: "example",
		User:     "root",
		Password: "",
	}
	dst := &mysql.Config{
		Host:     "10.200.20.39",
		Port:     "5000",
		Database: "example_dummy",
		User:     "root",
		Password: "",
	}

	err := copyTables(src, dst)
	if err != nil {
		t.Fatal(err)
	}

}
