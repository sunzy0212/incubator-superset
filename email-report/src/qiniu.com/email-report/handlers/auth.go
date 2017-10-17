package services

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const adminName string = "admin"
const adminPwd string = "pandoraadmin"

type AdminForm struct {
	User     string `form:"user",bingding:"required"`
	Password string `form:"password",bingding:"required"`
}

func Auth(c *gin.Context) {
	var authForm AdminForm
	if c.Bind(&authForm) == nil {
		if authForm.User == adminName && authForm.Password == adminPwd {
			c.Next()
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "auth failed. contact admin to get user/pwd"})
			c.Abort()
		}
	}

}


