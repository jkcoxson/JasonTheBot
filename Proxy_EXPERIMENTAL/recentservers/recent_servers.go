package recentservers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"sync"
	"sync/atomic"
)

var recentServersFilenameSet uint32 = 0
var recentServersFilename atomic.Value
var loadRecentServersOnce sync.Once
var recentServers map[string]string

func init() {
	recentServersFilename.Store("")
	recentServers = make(map[string]string)
}

func handleConfig() error {
	// Check if the config filename for the most recent servers is set
	if atomic.LoadUint32(&recentServersFilenameSet) == 0 {
		return fmt.Errorf("the recent servers filename is not set, please set it before using the module")
	}

	// Load the most recent servers from the config file if not already done
	var configErr error = nil
	loadRecentServersOnce.Do(func() {
		data, err := ioutil.ReadFile(recentServersFilename.Load().(string))
		if err != nil {
			configErr = err
			return
		}

		err = json.Unmarshal(data, &recentServers)
		if err != nil {
			configErr = err
			return
		}
	})
	if configErr != nil {
		return configErr
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
func SetConfigFile(filename string) {
	recentServersFilename.Store(filename)
	atomic.StoreUint32(&recentServersFilenameSet, 1)
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
