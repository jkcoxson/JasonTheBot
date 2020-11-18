package server

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"sync"
)

// RecentServersCollection -- stores the servers that players
//							  have most recently played on
type RecentServersCollection struct {
	filename string // SHOULD ONLY BE READ
	data     map[string]string
	mutex    sync.RWMutex
}

// LoadRecentServers -- loads the servers that have been most
//						recently played on by players
func LoadRecentServers(configFile string) (*RecentServersCollection, error) {
	// Load the most recent servers from the config file
	fileData, err := ioutil.ReadFile(configFile)
	if err != nil {
		return nil, fmt.Errorf("load recent servers: error reading config from file")
	}

	var collection RecentServersCollection
	collection.filename = configFile
	collection.data = map[string]string{}

	err = json.Unmarshal(fileData, &collection.data)
	if err != nil {
		return nil, fmt.Errorf("load recent servers: error parsing JSON config")
	}

	return &collection, nil
}

func (rsCollection *RecentServersCollection) update() error {
	rsCollection.mutex.RLock()
	dataToWrite, err := json.Marshal(rsCollection.data)
	rsCollection.mutex.RUnlock()
	if err != nil {
		return fmt.Errorf("error encoding recent server data as JSON")
	}

	err = ioutil.WriteFile(rsCollection.filename, dataToWrite, 0644)
	if err != nil {
		return fmt.Errorf("error writing recent server data to disk")
	}

	return nil
}

// GetRecentServer -- Gets the most recent server for the player,
//					  or saves the default in the player's entry
//					  and returns that
func (rsCollection *RecentServersCollection) GetRecentServer(playerName string, defaultServer string) (string, error) {
	rsCollection.mutex.RLock()
	recentServer, recentServerStored := rsCollection.data[playerName]
	rsCollection.mutex.RUnlock()

	if !recentServerStored {
		rsCollection.mutex.Lock()
		rsCollection.data[playerName] = defaultServer
		rsCollection.mutex.Unlock()

		err := rsCollection.update()
		if err != nil {
			return defaultServer, err
		}

		return defaultServer, nil
	}

	return recentServer, nil
}

// SetRecentServer -- Sets the most recent server for the player
//					  and saves it out to the config file
func (rsCollection *RecentServersCollection) SetRecentServer(playerName string, recentServer string) error {
	rsCollection.mutex.Lock()
	rsCollection.data[playerName] = recentServer
	rsCollection.mutex.Unlock()

	err := rsCollection.update()
	if err != nil {
		return err
	}

	return nil
}
