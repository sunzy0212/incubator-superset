package main

import (
	"fmt"
	"testing"

	"qiniupkg.com/kirk/kirksdk"
)

func TestKirkSdk(t *testing.T) {
	cfg := kirksdk.AccountConfig{
		AccessKey: "7gE4xWhNArG0NoFdLq76Kq0oPgIzdAs0ji-ZRxd9",
		SecretKey: "KwOxQ5CJtaCoUdS_oVqZE-gdS9v1kOvsCWAmdr_2",
		Host:      kirksdk.DefaultAccountHost,
	}
	accountClient := kirksdk.NewAccountClient(cfg)
	ret, err := accountClient.ListApps(nil)
	if err != nil {
		t.Fatal(err)
	} else {
		for i, v := range ret {
			t.Logf("%d ===> %#v", i, v)
		}
	}

	ret2, err := accountClient.GetAppspecs(nil, "wenchenxin.report")
	t.Logf("%#v", ret2, err)

	client, err := accountClient.GetQcosClient(nil, "wenchenxin.ffffffffffffffff")
	if err != nil {
		t.Fatal(err)
	}

	//get stack
	ret3, err := client.GetStack(nil, "teststack")
	if err != nil {
		//not exsit & create
		t.Logf("%#v", ret3.Status)
		//create stack
		err = client.CreateStack(nil, kirksdk.CreateStackArgs{Name: "teststack"})
		if err != nil {
			t.Fatal(err)
		}
	}
	t.Log(ret3.Status)

	default_master_quota := "4U8G"

	config := kirksdk.CreateServiceArgs{
		InstanceNum: 1,
		Name:        "report-server",
		Spec: kirksdk.ServiceSpec{
			AutoRestart: "always",
			Image:       "wenchenxin/report2:latest",
			UnitType:    default_master_quota,
			Envs: []string{fmt.Sprintf("QINIU_ACCESS_KEY=%s", cfg.AccessKey),
				fmt.Sprintf("QINIU_SECRET_KEY=%s", cfg.SecretKey),
				fmt.Sprintf("REPORT_WEB_HOST=%s", "")},
		},
		Stateful: true,
		Volumes: []kirksdk.VolumeSpec{
			kirksdk.VolumeSpec{
				Name:      "mongodisk",
				FsType:    "ext4",
				UnitType:  "SATA_10G",
				MountPath: "/data/db",
			},
		},
	}

	//get stack
	ret4, err := client.GetStack(nil, "teststack")
	if err != nil {
		t.Fatal(err)
	} else {
		t.Logf("%#v", ret4)
		info, err := client.GetServiceInspect(nil, ret4.Name, config.Name)
		if err != nil {
			t.Logf("%#v", err)
			err = client.CreateService(nil, ret4.Name, config)
			if err != nil {
				t.Fatal(err)
			}
		} else {
			t.Logf("%#v", info)
			updateConfig := kirksdk.UpdateServiceArgs{
				ManualUpdate: false,
			}
			err = client.UpdateService(nil, info.Stack, info.Name, updateConfig)
			if err != nil {
				t.Fatal(err)
			}
		}
	}
	const (
		PUBLIC_IP   = "PUBLIC_IP"
		DOMAIN      = "DOMAIN"
		INTERNAL_IP = "INTERNAL_IP"
	)
	apConfig := kirksdk.CreateApArgs{
		Type:      PUBLIC_IP,
		Provider:  "Telecom",
		Bandwidth: 10,
		UnitType:  "BW_10M",
		Title:     "Report address",
	}

	aps, err := client.ListAps(nil, kirksdk.ListApsArgs{})
	if err != nil {
		t.Fatal(err)
	}
	if len(aps) == 0 {
		ap, err := client.CreateAp(nil, apConfig)
		if err != nil {
			t.Fatal(err)
		} else {
			t.Logf("Ap ==> %#v", ap)
		}
	} else {
		apid := aps[0]
		setting := kirksdk.SetApPortArgs{
			Proto:       "TCP",
			BackendPort: 8000,
			Backends: []kirksdk.ApBackendArgs{
				kirksdk.ApBackendArgs{
					Stack:   ret4.Name,
					Service: config.Name,
				},
			},
		}
		err = client.SetApPort(nil, apid.ApID, "443", setting)
		if err != nil {
			t.Fatal(err)
		}
	}

}
