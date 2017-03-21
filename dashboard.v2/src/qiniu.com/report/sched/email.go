package sched

import (
	"crypto/tls"
	"errors"
	"fmt"
	"net/mail"
	"net/smtp"
	"os"
	"strconv"
	"strings"

	"qiniupkg.com/x/log.v7"
)

type Email struct {
	name string
	spec string
}

type EmailConfig struct {
	Name string `json:"name"`
}

func NewEmail(spec string, cfg EmailConfig) *Email {
	return &Email{name: cfg.Name, spec: spec}
}

func (r *Email) Spec() string {
	return r.spec
}
func (r *Email) Name() string {
	return r.name
}
func (r *Email) Type() string {
	return "EMAIL"
}

func (r *Email) Run() {
	log.Println(fmt.Sprintf("执行`%s`: spec{%s}\ttype:%s", r.Name(), r.Spec(), r.Type()))
}

type EmailClient struct {
	Receiver []string
	CC       string
	Body     []byte
	Subject  string

	User       string
	Password   string
	ServerAddr string
	ServerPort int
}

func (client *EmailClient) Send() error {
	var auth smtp.Auth
	if client.User != "" && client.Password != "" {
		auth = smtp.PlainAuth("", client.User, client.Password, client.ServerAddr)

	} else {
		auth = nil
		return
	}

	subject := client.Subject + "\n"

	var from = mail.Address{"", client.User}
	var to string = strings.Join(client.Receiver, ",")

	// Setup headers
	headers := make(map[string]string)
	headers["From"] = from.String()
	headers["To"] = to
	headers["Cc"] = client.CC
	headers["MIME-version"] = "1.0"
	headers["Content-Type"] = `text/html; charset="utf-8"`

	// Setup message
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "Subject: " + subject
	message += "\r\n" + string(client.Body)

	tlsconfig := &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         client.ServerAddr,
	}

	serverNamePort := client.ServerAddr + ":" + strconv.Itoa(client.ServerPort)

	conn, err := tls.Dial("tcp", serverNamePort, tlsconfig)
	if err != nil {
		return err
	}

	c, err := smtp.NewClient(conn, client.ServerAddr)
	if err != nil {
		return err
	}

	// Auth
	if err = c.Auth(auth); err != nil {
		return err
	}

	// To && From
	if err = c.Mail(client.User); err != nil {
		return err
	}

	for _, r := range client.Receiver {
		if err = c.Rcpt(r); err != nil {
			return err
		}
	}
	if client.CC != "" {
		if err = c.Rcpt(client.CC); err != nil {
			return err
		}
	}

	// Data
	w, err := c.Data()
	if err != nil {
		return err
	}

	_, err = w.Write([]byte(message))
	if err != nil {
		return err
	}

	err = w.Close()
	if err != nil {
		return err
	}

	c.Quit()
	log.Infof("Email from %s to %v is sent", client.User, client.Receiver)
	return err
}

func SendEmailWithConfigReady(body []byte, subject string, rec []string, cc string) error {

	emailUser := os.Getenv("PANDORA_EMAIL_USER")
	emailPassword := os.Getenv("PANDORA_EMAIL_PASSWORD")
	emailServerAddr := os.Getenv("PANDORA_EMAIL_SERVER_ADDR")
	emailServerAddrPortStr := os.Getenv("PANDORA_EMAIL_SERVER_ADDR_PORT")

	if emailServerAddr == "" || emailServerAddrPortStr == "" {
		return errors.New("Cannot read email server address and port from system env!")
	}

	if len(rec) == 0 {
		return errors.New("there is at least one receiver")
	}

	emailServerAddrPortInt, err := strconv.ParseInt(emailServerAddrPortStr, 10, 32)
	if err != nil {
		return err
	}

	client := EmailClient{
		ServerAddr: emailServerAddr,
		ServerPort: int(emailServerAddrPortInt),
		User:       emailUser,
		Password:   emailPassword,
		Subject:    subject,
		Body:       body,
		Receiver:   rec,
		CC:         cc,
	}

	if err := client.Send(); err != nil {
		return err
	}
	return nil
}
