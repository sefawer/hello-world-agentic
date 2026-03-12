package hub

import (
    "encoding/json"
    "log"
    "time"

    "github.com/gorilla/websocket"
    "github.com/sefawer/hello-world-agentic/websocket/internal/models"
)

type Client struct {
    hub  *Hub
    conn *websocket.Conn
    send chan []byte
}

func (c *Client) readPump() {
    defer func() {
        c.hub.unregister <- c
        c.conn.Close()
    }()

    for {
        _, _, err := c.conn.ReadMessage()
        if err != nil {
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
                log.Printf("WebSocket error: %v", err)
            }
            break
        }
    }
}

func (c *Client) writePump() {
    ticker := time.NewTicker(30 * time.Second)
    defer func() {
        ticker.Stop()
        c.conn.Close()
    }()

    for {
        select {
        case message, ok := <-c.send:
            if !ok {
                c.conn.WriteMessage(websocket.CloseMessage, []byte{})
                return
            }

            c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
            if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
                return
            }

        case <-ticker.C:
            c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
            heartbeat := models.HeartbeatMessage{
                Type:      "heartbeat",
                Timestamp: time.Now().UTC(),
            }
            data, _ := json.Marshal(heartbeat)
            if err := c.conn.WriteMessage(websocket.TextMessage, data); err != nil {
                return
            }
        }
    }
}