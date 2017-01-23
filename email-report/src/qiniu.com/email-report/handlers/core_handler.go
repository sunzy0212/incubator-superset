package services

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"qiniu.com/email-report/services"

	"github.com/gin-gonic/gin"
)

type rowHeader []string
type rowData [][]interface{}

// group 对应html一个table
type Group struct {
	Title       string    `json:"title"`
	TableHeader rowHeader `json:"table_header"`
	TableRows   rowData   `json:"table_rows"`
}

type Service struct {
	TableContents []Group  `json:"table_contents,omitempty"`
	Body          string   `json:"body,omitempty"`
	Subject       string   `json:"subject"`
	Receivers     []string `json:"receivers"`
	CCReceiver    string   `json:"cc_receiver"`
}

func (this *Service) String() string {
	return fmt.Sprintf("Services handle %d tables. Using subject:%s,Receivers:%v,CCReceivers:%s",
		len(this.TableContents), this.Subject, this.Receivers, this.CCReceiver)
}

// core email report handler
func CoreHandler(c *gin.Context) {
	request := c.Request
	body, err := ioutil.ReadAll(request.Body)
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": err})
	}

	service := Service{}
	err = json.Unmarshal(body, &service)
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}

	renderedTemplate, err := services.TemplateService(services.DefaultTemplateUrl, service)
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": err})
	}

	err = services.SendEmailWithConfigReady(renderedTemplate.Bytes(), service.Subject, service.Receivers, service.CCReceiver)
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
	}

	c.JSON(http.StatusOK, gin.H{})
}
