package server

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

// Server -- respresents a server config in a
// 			 servers.json config file
type Server struct {
	Name           string
	UpstreamPort   uint16
	DownstreamPort uint16
	Services       []string
}

// ConfigCollection -- stores several server configs (Server instance)
//					   and offers utilities around them
type ConfigCollection struct {
	data []Server
}

// ServerExists -- returns whether a server with the
//				   given name exists in the config
func (collection *ConfigCollection) ServerExists(name string) bool {
	for i := 0; i < len(collection.data); i++ {
		if collection.data[i].Name == name {
			return true
		}
	}

	return false
}

// DefaultServer -- Returns the first server defined
//					as the default server of the collection
// IMPORTANT--THE *Server THAT'S RETURNED SHOULD ONLY BE READ, NOT WRITTEN
func (collection *ConfigCollection) DefaultServer() (*Server, error) {
	if len(collection.data) > 0 {
		return &collection.data[0], nil
	}

	return nil, fmt.Errorf("no servers defined, so no default server exists")
}

// GetServer -- returns the config for the server with the given name
// IMPORTANT--THE *Server THAT'S RETURNED SHOULD ONLY BE READ, NOT WRITTEN
func (collection *ConfigCollection) GetServer(name string) (*Server, error) {
	for i := 0; i < len(collection.data); i++ {
		if collection.data[i].Name == name {
			return &collection.data[i], nil
		}
	}

	return nil, fmt.Errorf("a server with that name doesn't exist")
}

// LoadServers -- load the servers stored in the config file
func LoadServers(configFile string) (*ConfigCollection, error) {
	data, err := ioutil.ReadFile(configFile)
	if err != nil {
		return nil, fmt.Errorf("load servers: error reading from file")
	}

	var servers ConfigCollection
	err = json.Unmarshal(data, &servers.data)
	if err != nil {
		return nil, fmt.Errorf("load servers: error parsing JSON")
	}

	return &servers, nil
}
