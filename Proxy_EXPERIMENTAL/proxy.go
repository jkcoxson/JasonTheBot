package main

import (
	"fmt"

	"./recentservers"
)

func main() {
	servers, err := loadServers("config/servers.json")
	if err != nil {
		panic(err)
	}

	err = recentservers.SetConfigFile("config/recent_servers.json")
	if err != nil {
		panic(err)
	}

	recentServer, err := recentservers.GetRecentServer("Lydia", servers[0].Name)
	if err != nil {
		panic(err)
	}
	fmt.Println(recentServer)
}
