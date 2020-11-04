package recentservers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"sync/atomic"
)

var recentServersFilename atomic.Value
var recentServersLoaded uint32 = 0
var recentServers map[string]string

func init() {
	recentServersFilename.Store("")
	recentServers = make(map[string]string)
}

func handleConfig() error {
	// Check if the config filename for the most recent servers is set
	if atomic.LoadUint32(&recentServersLoaded) == 0 {
		return fmt.Errorf("the recent servers are not loaded, please set the recent servers filename before using this module")
	}

	return nil
}

func updateRecentServers() error {
	err := handleConfig()
	if err != nil {
		return err
	}

	dataToWrite, err := json.Marshal(recentServers)
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(recentServersFilename.Load().(string), dataToWrite, 0644)
	if err != nil {
		return err
	}

	return nil
}

// SetConfigFile -- sets the JSON file that this module
//					should use as a config file to load and
//					store the most recent servers that players
//					have been on
func SetConfigFile(filename string) error {
	recentServersFilename.Store(filename)

	// Load the most recent servers from the config file
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		return err
	}

	err = json.Unmarshal(data, &recentServers)
	if err != nil {
		return err
	}

	atomic.StoreUint32(&recentServersLoaded, 1)
	return nil
}

// GetRecentServer -- Gets the most recent server for the player,
//					  or saves the default in the player's entry
//					  and returns that
func GetRecentServer(playerName string, defaultServer string) (string, error) {
	err := handleConfig()
	if err != nil {
		return defaultServer, err
	}

	recentServer, recentServerStored := recentServers[playerName]
	if !recentServerStored {
		recentServers[playerName] = defaultServer
		err = updateRecentServers()
		if err != nil {
			return defaultServer, err
		}
		return defaultServer, nil
	}
	return recentServer, nil
}

// SetRecentServer -- Sets the most recent server for the player
//					  and saves it out to the config file
func SetRecentServer(playerName string, recentServer string) error {
	err := handleConfig()
	if err != nil {
		return err
	}

	recentServers[playerName] = recentServer

	err = updateRecentServers()
	if err != nil {
		return err
	}

	return nil
}
