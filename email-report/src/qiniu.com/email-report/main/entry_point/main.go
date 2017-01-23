package main

import (
	"os"

	"github.com/gin-gonic/gin"
	handler "qiniu.com/email-report/handlers"
)

func main() {

	listenPort := os.Getenv("PORT_HTTP")
	if listenPort == "" {
		listenPort = "8080"
	}
	router := gin.Default()

	//v1
	v1 := router.Group("/v1")
	{
		v1.POST("/mail", handler.CoreHandler)
	}

	// admin interface
	v1.Use(handler.Auth)
	{
		v1.POST("/admin/env", handler.UpdateEnvHandler)                   // update email server config
		v1.POST("/admin/template", handler.UpdateTemplateManuallyHandler) // update template manually
	}

	router.Run(":" + listenPort)
}
