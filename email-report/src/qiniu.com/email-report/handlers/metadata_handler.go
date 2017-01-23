package services

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"qiniu.com/email-report/services"
)

type envs []map[string]string

func UpdateEnvHandler(c *gin.Context) {
	reqBody, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
	}
	env := make(envs, 0)
	err = json.Unmarshal(reqBody, env)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}

	for _, envKV := range env {
		for k, v := range envKV {
			os.Setenv(k, v)
		}
	}
	c.JSON(http.StatusOK, gin.H{})

}

func UpdateTemplateManuallyHandler(c *gin.Context) {
	url := c.DefaultQuery("url", services.DefaultTemplateUrl)
	services.UpdateTemplateFromHttp(url, true)
	c.JSON(http.StatusOK, gin.H{})
}
