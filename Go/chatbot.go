package main

import (
	"bufio"
	"fmt"
	"os"
	"time"
	"strings"

	"github.com/google/uuid"
	"github.com/sandertv/gophertunnel/minecraft"
	"github.com/sandertv/gophertunnel/minecraft/protocol/login"
	"github.com/sandertv/gophertunnel/minecraft/protocol/packet"
)

var SendAvailable = false
var ToSend = ""
var garbagecollector = ""

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
		if SendAvailable {
			fmt.Println(ToSend)
			conn.WritePacket(&packet.Text{
				TextType: packet.TextTypeChat,
				Message:  ToSend,
			})
			SendAvailable = false
		}

		if err != nil {
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