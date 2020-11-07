package servers

import (
	"encoding/json"
	"io/ioutil"
)

// Server -- struct representing a server config in a
// 			 servers.json config file
type Server struct {
	Name           string
	UpstreamPort   uint16
	DownstreamPort uint16
	Services       []string
}

// LoadServers -- load the servers stored in the config file
func LoadServers(configFile string) ([]Server, error) {
	data, err := ioutil.ReadFile(configFile)
	if err != nil {
		return nil, err
	}

	var servers []Server
	err = json.Unmarshal(data, &servers)
	if err != nil {
		return nil, err
	}

	return servers, nil
}
