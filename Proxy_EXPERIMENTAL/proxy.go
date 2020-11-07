package main

import (
	"fmt"

	"./recentservers"
	"./servers"
)

func main() {
	servers, err := servers.LoadServers("config/servers.json")
	if err != nil {
		panic(err)
	}

	err = recentservers.SetConfigFile("config/recent_servers.json")
	if err != nil {
		panic(err)
	}

	recentServer, err := recentservers.GetRecentServer("Player-name", servers[0].Name)
	if err != nil {
		panic(err)
	}
	fmt.Println(recentServer)
}
