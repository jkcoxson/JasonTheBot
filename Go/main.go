package main

import (
	"bufio"
	"fmt"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/sandertv/gophertunnel/minecraft"
	"github.com/sandertv/gophertunnel/minecraft/protocol/login"
	"github.com/sandertv/gophertunnel/minecraft/protocol/packet"
)

var SendAvailable = false
var ToSend = ""

func main() {
	go Minecraft()
	go Buffalo()
	for {
		time.Sleep(1000)
	}

}

func Minecraft() {
	//fmt.Println("Ran Minecraft")
	// Connect to the server.
	conn, err := minecraft.Dialer{
		IdentityData: login.IdentityData{
			DisplayName: "JasonTheBot",
			Identity:    uuid.New().String(),
		},
	}.Dial("raknet", "67.199.177.214:19134")
	if err != nil {
		panic(err)
	}
	// Make the client spawn in the world.
	if err := conn.DoSpawn(); err != nil {
		panic(err)
	}
	defer conn.Close()
	for {
		// Example: Read a packet from the connection.
		pk, err := conn.ReadPacket()
		if text, ok := pk.(*packet.Text); ok {
			fmt.Println(text)
			fmt.Println()

		}
		if SendAvailable {
			conn.WritePacket(&packet.Text{
				TextType: packet.TextTypeChat,
				Message:  ToSend,
			})
			SendAvailable = false
		}

		if err != nil {
			break
		}

		// Example: Send a packet to the server in response to the previous packet.
		if err := conn.WritePacket(&packet.RequestChunkRadius{ChunkRadius: 32}); err != nil {
			break
		}
	}
}
func Buffalo() {
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		SendAvailable = true
		ToSend = scanner.Text()
	}
	if err := scanner.Err(); err != nil {
		//log.Println(err)
	}
}
