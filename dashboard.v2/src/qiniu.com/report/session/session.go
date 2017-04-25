package session

import (
	"time"

	"github.com/patrickmn/go-cache"
)

type Session interface {
	Set(key string, value interface{})  //set session value
	Get(key string) (interface{}, bool) //get session value
	Delete(key string)                  //delete session value
}

type Provider struct {
	cache *cache.Cache
}

func New() Session {
	c := cache.New(30*time.Minute, 1*time.Minute)
	return Provider{c}
}

func (m Provider) Set(key string, value interface{}) {
	m.cache.Set(key, value, 30*time.Minute)
}

func (m Provider) Get(key string) (value interface{}, found bool) {
	if value, found := m.cache.Get(key); found {
		m.Set(key, value) // reflash expiration time
	}
	return
}

func (m Provider) Delete(key string) {
	m.cache.Delete(key)
}
