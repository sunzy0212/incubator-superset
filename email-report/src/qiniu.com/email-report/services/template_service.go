package services

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"text/template"

	"github.com/gin-gonic/gin"
	"github.com/qiniu/log.v1"
)

const DefaultTemplateUrl = "http://iovip.qbox.me/common.html"
const templateUrlCDN = "oji8s4dhx.bkt.clouddn.com"

const DefaultTemplateName string = "common.html"
const DefaultHttpTemplateSource string = "/tmp/" + DefaultTemplateName

// TemplateService: try to put data interface{} into templateSource.
// return a *bytes.Buffer as a result
// templateSource is either a http url or file url which can get a xxx.html(golang html template)
func TemplateService(templateSource string, data interface{}) (templateBuff *bytes.Buffer, err error) {
	if templateSource == "" {
		templateSource = os.Getenv("EMAIL_TEMPLATE_NAME")
	}
	// try using template http source
	// download the http source template to /tmp/common.html
	if templateSource == "" || strings.HasPrefix(strings.ToLower(templateSource), "http") {
		_, err = os.Stat(DefaultHttpTemplateSource)
		if os.IsNotExist(err) {
			if gin.IsDebugging() {
				log.Debugf("template file not exist. download now!")
			}
			err = UpdateTemplateFromHttp(templateSource, true)
			if err != nil {
				return
			}
		}
		err = nil
		templateSource = DefaultHttpTemplateSource

	}

	if _, err = os.Stat(templateSource); err != nil {
		if os.IsNotExist(err) {
			return
		}
		err = nil
	}

	var parsedTemplate *template.Template
	parsedTemplate, err = template.ParseFiles(templateSource)
	if err != nil {
		return
	}

	templateBuff = new(bytes.Buffer)
	err = parsedTemplate.Execute(templateBuff, data)
	if err != nil {
		return
	}
	log.Infof("using template:%s", templateSource)
	return

}

func UpdateTemplateFromHttp(newTemplate string, cdn bool) error {
	var req *http.Request
	var err error
	req, err = http.NewRequest("GET", newTemplate, nil)
	if err != nil {
		return err
	}
	if cdn {
		req.Host = templateUrlCDN
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}

	resBody, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(DefaultHttpTemplateSource, resBody, 0755)
	if err != nil {
		return err
	}
	return nil
}
