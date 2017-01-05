package db

import (
	"fmt"

	"github.com/qiniu/db/mgoutil.v3"
	"github.com/qiniu/log.v1"
	"gopkg.in/mgo.v2"
)

func IsExist(c mgoutil.Collection, m interface{}) (bool, error) {
	q := c.Find(m)
	count, err := q.Count()
	if err != nil {
		return true, err
	}
	if count > 0 {
		return true, nil
	}
	return false, nil
}

func QueryCount(c mgoutil.Collection, m interface{}) (n int, err error) {
	n, err = c.Find(m).Count()
	if err != nil {
		log.Error(err)
		return
	}
	return
}

func DoInsert(c mgoutil.Collection, m interface{}) (err error) {
	err = c.Insert(m)
	if err != nil {
		log.Error(err)
		return
	}
	return
}

func DoDelete(c mgoutil.Collection, m interface{}) (err error) {
	err = c.Remove(m)
	if err != nil {
		return
	}
	return
}

func DoUpdate(c mgoutil.Collection, selector interface{}, change interface{}) (err error) {
	err = c.Update(selector, change)
	if err != nil {
		log.Error(err)
		return
	}
	return
}

func DoUpsert(c mgoutil.Collection, selector interface{}, change interface{}) (err error) {
	_, err = c.Upsert(selector, change)
	if err != nil {
		log.Error(err)
		return
	}
	return
}

func SafeCloseIter(iter *mgo.Iter) (err error) {
	if err = iter.Close(); err != nil {
		log.Error(err)
	}
	return
}

func EnsureNotExist(c mgoutil.Collection, selector interface{}) (err error) {
	exist, err := IsExist(c, selector)
	if err != nil {
		return
	}
	if exist {
		err = fmt.Errorf("The resource specified by %v already exists", selector)
		return
	}
	return
}

func EnsureExist(c mgoutil.Collection, selector interface{}) (err error) {
	exist, err := IsExist(c, selector)
	if err != nil {
		return
	}
	if !exist {
		err = fmt.Errorf("The resource specified by %v does not exists", selector)
		return
	}
	return
}

func DoDeleteAll(c mgoutil.Collection, selector interface{}, ignoreNotFound bool) (err error) {
	_, err = c.RemoveAll(selector)
	if err != nil {
		if ignoreNotFound && err.Error() == mgo.ErrNotFound.Error() {
			err = nil
			return
		}
		log.Error(err)
	}
	return
}

func DoDeleteOne(c mgoutil.Collection, selector interface{}, ignoreNotFound bool) (err error) {
	err = c.Remove(selector)
	if err != nil {
		log.Error(err)
		if ignoreNotFound && err.Error() == mgo.ErrNotFound.Error() {
			err = nil
		}
	}
	return
}
