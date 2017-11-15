package services

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"qiniu.com/email-report/services"
)

// core email report handler
func UserHandler(c *gin.Context) {
	request := c.Request
	uidStr := request.URL.Query().Get("uid")
	uid, err := strconv.ParseInt(uidStr, 10, 64)
	if err != nil {
		c.JSON(400, err.Error())
		return
	}
	result, err := services.GetUInformation(uint32(uid))
	if err != nil {
		c.JSON(500, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}
