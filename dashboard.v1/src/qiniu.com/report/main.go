package main

import (
	"html/template"
	"io"
	"log"
	"net/http"
	"runtime"
	"time"
)

const STATIC_URL string = "/static/"
const STATIC_ROOT string = "static/"

type Context struct {
	Title  string
	Static string
}

func Home(w http.ResponseWriter, req *http.Request) {
	context := Context{Title: "Welcome!"}
	render(w, "index", context)
}

func Login(w http.ResponseWriter, req *http.Request) {
	context := Context{Title: "Login"}
	render(w, "login", context)
}

func render(w http.ResponseWriter, tmpl string, context Context) {
	context.Static = STATIC_URL
	tmpl_list := []string{"index.html"}
	//    fmt.Sprintf("static/%s.html", tmpl)}
	t, err := template.ParseFiles(tmpl_list...)
	if err != nil {
		log.Print("template parsing error: ", err)
	}
	err = t.Execute(w, context)
	if err != nil {
		log.Print("template executing error: ", err)
	}
}

func StaticHandler(w http.ResponseWriter, req *http.Request) {
	static_file := req.URL.Path[len(STATIC_URL):]
	if len(static_file) != 0 {
		f, err := http.Dir(STATIC_ROOT).Open(static_file)
		if err == nil {
			content := io.ReadSeeker(f)
			http.ServeContent(w, req, static_file, time.Now(), content)
			return
		}
	}
	http.NotFound(w, req)
}

func main() {
	runtime.GOMAXPROCS(runtime.NumCPU()/2 + 1)
	http.HandleFunc("/", Home)
	http.HandleFunc("/login/", Login)
	http.HandleFunc(STATIC_URL, StaticHandler)
	log.Println("listening at 8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
