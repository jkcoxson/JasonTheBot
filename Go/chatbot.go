package main

import (
	"bufio"
	"fmt"
	"os"
	"time"
	"strings"
	"log"

	"github.com/google/uuid"
	"github.com/sandertv/gophertunnel/minecraft"
	"github.com/sandertv/gophertunnel/minecraft/protocol/login"
	"github.com/sandertv/gophertunnel/minecraft/protocol/packet"
)

var sendAvailable = false
var toSend = ""

func main() {
	go connectToServer()
	go buffalo()
	for {
		time.Sleep(1000)
	}

}

func connectToServer() {
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

	// Close the connection when the program exits
	defer conn.Close()

	// Read and write packets for ever and ever
	for {
		// Example: Read a packet from the connection.
		pk, err := conn.ReadPacket()
		if err != nil {
			panic(err)
		}

		if text, ok := pk.(*packet.Text); ok {
			switch text.TextType {
			case packet.TextTypeChat:
				fmt.Printf("Chat: {%s}: %s\n", text.SourceName, text.Message)
			case packet.TextTypeTranslation:
				if text.Message == "chat.type.sleeping" {
					fmt.Printf("Sleeping: {%s}\n", text.Parameters[0])
				} else if strings.HasPrefix(text.Message, "death") {
					fmt.Printf("Death: {%s}\n", text.Parameters[0])
				}
			}
		}

		if sendAvailable {
			conn.WritePacket(&packet.Text{
				TextType: packet.TextTypeChat,
				Message:  toSend,
			})
			sendAvailable = false
		}
	}
}

func buffalo() {
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		sendAvailable = true;
		toSend = scanner.Text();
		fmt.Printf("Sending %s\n", toSend)
	}
	
	if err := scanner.Err(); err != nil {
		log.Println(err)
	}
}
