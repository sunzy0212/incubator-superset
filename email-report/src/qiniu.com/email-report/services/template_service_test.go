package services

import (
	"github.com/stretchr/testify.v2/assert"
	"os"
	"testing"
)

func TestTemplateService(t *testing.T) {

	var templateContent string = "<h1>{{ .MockObject }}</h1>"
	f, err := os.OpenFile("/tmp/mock.html", os.O_CREATE|os.O_WRONLY, 0755)
	if err != nil {
		t.Error(err)
	}
	defer func() {
		f.Close()
		os.Remove("/tmp/mock.html")
	}()
	f.WriteString(templateContent)
	err = f.Sync()
	if err != nil {
		t.Error(err)
	}

	type TempStrcut struct {
		MockObject string `json:"mock_object"`
	}

	ts := TempStrcut{
		MockObject: "mock string",
	}

	buf, err := TemplateService("/tmp/mock.html", ts)
	if err != nil {
		return
	}

	exceptRenderString := "<h1>mock string</h1>"
	assert.Equal(t, exceptRenderString, buf.String())

}
