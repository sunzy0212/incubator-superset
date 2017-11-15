package biserver

import (
	"runtime"
	"sync"

	"github.com/mengjinglei/ferry/mysql"
)

func copyTables(srcCfg *mysql.Config, destCfg *mysql.Config) (err error) {

	tables := getTables(srcCfg)

	var wg sync.WaitGroup
	jobs := make(chan string)

	worker := func(jobs <-chan string) {
		for tableName := range jobs {
			if tableName == "query" {
				continue
			}
			copier := mysql.NewTableCopier(tableName, srcCfg, destCfg)
			copier.Copy()
			copier.Close()
		}
		wg.Done()
	}

	for w := 0; w < runtime.GOMAXPROCS(-1); w++ {
		wg.Add(1)
		go worker(jobs)
	}

	for _, name := range *tables {
		jobs <- name
	}
	close(jobs)
	wg.Wait()

	return
}

func getTables(c *mysql.Config) *[]string {
	db := mysql.NewDB(c)
	return db.ListTables()
}
