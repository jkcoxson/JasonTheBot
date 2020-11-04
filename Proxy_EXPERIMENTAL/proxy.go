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

	recentservers.SetConfigFile("config/recent_servers.json")
	recentServer, err := recentservers.GetRecentServer("Seth", servers[0].Name)
	if err != nil {
		panic(err)
	}
	fmt.Println(recentServer)
}
