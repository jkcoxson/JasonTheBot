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

func main() {
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

	// Close the connection when we exit
	defer conn.Close()

	go literacy(conn)
	go buffalo(conn)

	for {
		time.Sleep(time.Second)
	}
}

func literacy(conn *minecraft.Conn) {
	// Read packets forever and ever
	for {
		// Example: Read a packet from the connection.
		pk, err := conn.ReadPacket()
		if err != nil {
			break
		}
		if text, isTextPacket := pk.(*packet.Text); isTextPacket {
			switch text.TextType {
				case packet.TextTypeChat:
					if text.SourceName != "JasonTheBot" {
						fmt.Printf("Chat: {%s}: %s\n", text.SourceName, text.Message)
					}
				case packet.TextTypeTranslation:
					if text.Message == "chat.type.sleeping" {
						fmt.Printf("Sleeping: {%s}\n", text.Parameters[0])
					} else if strings.HasPrefix(text.Message, "death") {
						fmt.Printf("Death: {%s}\n", text.Parameters[0])
					}
			}
		}
	}
}

func buffalo(conn *minecraft.Conn) {
	// Read from stdin and chat it
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		conn.WritePacket(&packet.Text{
			TextType: packet.TextTypeChat,
			Message: scanner.Text(),
		})
	}

	// Log errors
	if err := scanner.Err(); err != nil {
		log.Println(err)
	}
}