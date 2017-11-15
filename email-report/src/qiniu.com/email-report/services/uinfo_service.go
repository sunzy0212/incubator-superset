package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

type user struct {
	Uid          uint32 `json:"uid"`
	Email        string `json:"email"`
	FullName     string `json:"full_name"`
	IsEnterprise bool   `json:"is_enterprise"`
	IsCertified  bool   `json:"is_certified"`
	IsInternal   bool   `json:"is_internal"`
}

type userRes struct {
	Data user `json:"data"`
	Code int  `json:"code"`
}

type expiredRes struct {
	Error            string `json:"error"`
	ErrorCode        int    `json:"error_code"`
	ErrorDescription string `json:"error_description"`
}

const apiUrl = "https://api.qiniu.com"

func GetUInformation(uid uint32) (userRes, error) {
	uInfo := userRes{}

	requestLock.Lock()
	_, err := GetAccessToken()
	if err != nil && err != AlreadyExistErr {
		return uInfo, err
	}
	requestLock.Unlock()

	u := fmt.Sprintf("%s/api/developer/%d/overview", apiUrl, uid)
	req, err := http.NewRequest(http.MethodGet, u, nil)
	if err != nil {
		return uInfo, err
	}
	req.Header.Add("Authorization", "Bearer "+accessToken)

	httpClient := http.DefaultClient

	res, err := httpClient.Do(req)
	if err != nil {
		return uInfo, err
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return uInfo, err
	}

	// handle refresh token
	if res.StatusCode == http.StatusUnauthorized {
		r := expiredRes{}
		var errIn error
		errIn = json.Unmarshal(body, &r)
		if errIn != nil {
			return uInfo, errIn
		}
		if DoRefresh() == nil {
			log.Print("Refresh token and redo!")
			return GetUInformation(uid)
		} else {
			return uInfo, errors.New("refresh fail")
		}

	}

	err = json.Unmarshal(body, &uInfo)
	if err != nil {
		return uInfo, err
	}
	return uInfo, nil
}
