package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"sync"
	"sync/atomic"
)

var accessToken = ""
var refreshToken = ""
var requestCount int64 = 0
var lock sync.Mutex = sync.Mutex{}

var requestLock sync.Mutex = sync.Mutex{}

var username = os.Getenv("PANDORA_EMAIL")
var password = os.Getenv("PANDORA_PASSWORD")
var accServerAddress = "https://acc.qbox.me/oauth2/token"

type accessTokenResponse struct {
	AccessToken  string `json:"access_token"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
}

var AlreadyExistErr = errors.New("access token and refresh token already request!")

func GetAccessToken() (string, error) {
	if accessToken != "" {
		return "", AlreadyExistErr
	}
	atomic.AddInt64(&requestCount, 1)
	log.Printf("get access token for %d", requestCount)
	httpClient := http.DefaultClient
	v := url.Values{}
	v.Add("grant_type", "password")
	v.Add("username", username)
	v.Add("password", password)

	request, err := http.NewRequest(http.MethodPost, accServerAddress, bytes.NewBufferString(v.Encode()))
	if err != nil {
		return "", err
	}
	res, err := httpClient.Do(request)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return "", err
	}

	tokenInfo := &accessTokenResponse{}

	err = json.Unmarshal(body, tokenInfo)
	if err != nil {
		return "", err
	}

	lock.Lock()
	accessToken = tokenInfo.AccessToken
	refreshToken = tokenInfo.RefreshToken
	lock.Unlock()

	return accessToken, nil
}

func DoRefresh() error {
	httpClient := http.DefaultClient

	v := url.Values{}
	v.Add("grant_type", "refresh_token")
	v.Add("refresh_token", refreshToken)

	request, err := http.NewRequest(http.MethodPost, accServerAddress, bytes.NewBufferString(v.Encode()))
	if err != nil {
		return err
	}
	res, err := httpClient.Do(request)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}
	tokenInfo := &accessTokenResponse{}
	err = json.Unmarshal(body, tokenInfo)
	if err != nil {
		return err
	}

	lock.Lock()
	accessToken = tokenInfo.AccessToken
	refreshToken = tokenInfo.RefreshToken
	lock.Unlock()

	return nil

}
