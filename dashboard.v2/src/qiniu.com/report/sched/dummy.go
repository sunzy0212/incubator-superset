package sched

import (
	"fmt"
	"log"
)

type Dummy struct {
	name string
	spec string
}

type DummyConfig struct {
	Name string `json:"name"`
}

func NewDummy(spec string, cfg DummyConfig) *Dummy {
	return &Dummy{name: cfg.Name, spec: spec}
}

func (r *Dummy) Spec() string {
	return r.spec
}
func (r *Dummy) Name() string {
	return r.name
}
func (r *Dummy) Type() string {
	return "DUMMY"
}

func (r *Dummy) Run() {
	// time.Sleep(1 * time.Second) 模拟执行时长
	log.Println(fmt.Sprintf("执行`%s`: spec{%s}\ttype:%s", r.Name(), r.Spec(), r.Type()))
}
