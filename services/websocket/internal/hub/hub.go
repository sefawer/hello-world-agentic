package hub

import (
    "encoding/json"
    "log"
    "net/http"
    "sync"
    "time"

    "github.com/gorilla/websocket"
    "github.com/sefawer/hello-world-agentic/websocket/internal/models"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

type Hub struct {
    clients    map[*Client]bool
    register   chan *Client
    unregister chan *Client
    broadcast  chan []byte
    mu         sync.Mutex
}

func NewHub() *Hub {
    return &Hub{
        clients:    make(map[*Client]bool),
        register:   make(chan *Client),
        unregister: make(chan *Client),
        broadcast:  make(chan []byte),
    }
}

func (h *Hub) Run() {
    for {
        select {
        case client := <-h.register:
            h.mu.Lock()
            h.clients[client] = true
            h.mu.Unlock()
            log.Printf("Yeni client bağlandı. Toplam client: %d", len(h.clients))

        case client := <-h.unregister:
            h.mu.Lock()
            if _, ok := h.clients[client]; ok {
                delete(h.clients, client)
                close(client.send)
            }
            h.mu.Unlock()
            log.Printf("Client ayrıldı. Toplam client: %d", len(h.clients))

        case message := <-h.broadcast:
            h.mu.Lock()
            for client := range h.clients {
                select {
                case client.send <- message:
                default:
                    close(client.send)
                    delete(h.clients, client)
                }
            }
            h.mu.Unlock()
        }
    }
}

func (h *Hub) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("WebSocket upgrade hatası:", err)
        return
    }

    client := &Client{
        hub:  h,
        conn: conn,
        send: make(chan []byte, 256),
    }
    h.register <- client

    go client.writePump()
    go client.readPump()
}

func (h *Hub) BroadcastMessage(content string, timestamp time.Time) error {
    msg := models.WebSocketMessage{
        Type: "new_message",
        Data: models.Message{
            ID:        "",
            Content:   content,
            Timestamp: timestamp,
        },
    }

    data, err := json.Marshal(msg)
    if err != nil {
        return err
    }

    h.broadcast <- data
    log.Printf("Mesaj broadcast edildi: %s", content)
    return nil
}