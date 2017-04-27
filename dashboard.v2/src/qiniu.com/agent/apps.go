package main

import (
	"net/http"
	"os"

	"qiniupkg.com/x/log.v7"

	"github.com/go-martini/martini"
	"github.com/martini-contrib/binding"
	"github.com/martini-contrib/cors"
	"github.com/martini-contrib/render"

	"qiniu.com/agent/api"
)

func main() {
	webApp := martini.Classic()
	webApp.Use(martini.Static("static", martini.StaticOptions{Prefix: "static"}))
	webApp.Use(render.Renderer(render.Options{Directory: "templates"}))

	webApp.Use(func(res http.ResponseWriter, req *http.Request) {
		//		if req.Header.Get("X-API-KEY") != "secret123" {
		//			res.WriteHeader(http.StatusUnauthorized)
		//		}
	})
	//https://jira.qiniu.io/browse/QCOS-3809
	appUri := os.Getenv("USER_APP_URI")
	ak := os.Getenv("USER_ACCOUNT_AK")
	sk := os.Getenv("USER_ACCOUNT_SK")
	log.Infof("USER_APP_URI=%s", appUri)
	log.Infof("USER_ACCOUNT_AK=%s", ak)
	log.Infof("USER_ACCOUNT_SK=%s", sk)
	webApp.Use(cors.Allow(&cors.Options{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"PUT", "PATCH", "GET", "POST", "DELETE"},
		AllowHeaders:     []string{"Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	webApp.Use(render.Renderer(render.Options{
		Directory: "templates",
		//Layout:     "layout",
		Extensions: []string{".tmpl", ".html"},
		Delims:     render.Delims{"{{", "}}"},
		Charset:    "UTF-8",
		IndentJSON: true}))

	webApp.Get("/", func(r render.Render) {
		r.HTML(200, "index", nil)
	})

	webApp.Get("/api/healthcheck", func(r render.Render) {
		config := struct {
			Status  string
			Message string
		}{"running", "正在运行"}
		r.JSON(200, config)
	})
	c, err := api.New(api.Conf{
		USER_ACCOUNT_AK: ak,
		USER_ACCOUNT_SK: sk,
		USER_APP_URI:    appUri,
	})
	if err != nil {
		log.Fatal(err)
	}
	webApp.Group("/api", func(r martini.Router) {
		r.Get("/deployed", c.IsDeployed)
		r.Get("/isDeleted", c.IsDeleted)
		r.Post("/allocate", c.Allocate)
		r.Get("/reportHost", c.GetReportHost)
		r.Post("/update", c.UpdateReport)
		r.Get("/inspects", c.GetInspects)

		r.Get("/users", c.GetUsersList)
		r.Post("/users", binding.Bind(api.User{}), c.AddUser)
		r.Post("/users/:username", binding.Bind(api.User{}), c.UpdateUser)
		r.Delete("/users/:username", c.DeleteUser)
	})

	webApp.RunOnAddr(":8080")
}
