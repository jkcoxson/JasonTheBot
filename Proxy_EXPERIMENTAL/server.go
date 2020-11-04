package main

import (
	"encoding/json"
	"io/ioutil"
)

type server struct {
	Name           string
	UpstreamPort   uint16
	DownstreamPort uint16
}

func loadServers(configFile string) ([]server, error) {
	data, err := ioutil.ReadFile(configFile)
	if err != nil {
		return nil, err
	}

	var servers []server
	err = json.Unmarshal(data, &servers)
	if err != nil {
		return nil, err
	}

	return servers, nil
}
