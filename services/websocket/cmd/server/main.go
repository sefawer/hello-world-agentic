package main

import (
    "encoding/json"
    "log"
    "net/http"
    "os"
    "time"

    _ "github.com/gorilla/websocket"
    "github.com/joho/godotenv"
    "github.com/sefawer/hello-world-agentic/websocket/internal/hub"
    "github.com/sefawer/hello-world-agentic/websocket/internal/models"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    port := os.Getenv("WS_PORT")
    if port == "" {
        port = "8001"
    }

    h := hub.NewHub()
    go h.Run()

    http.HandleFunc("/ws", h.HandleWebSocket)

    http.HandleFunc("/api/broadcast", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }

        var req models.BroadcastRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        if req.Content == "" {
            req.Content = "Hello World"
        }
        if req.Timestamp.IsZero() {
            req.Timestamp = time.Now().UTC()
        }

        h.BroadcastMessage(req.Content, req.Timestamp)

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]string{
            "status": "broadcasted",
        })
    })

    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte(`{"status":"ok"}`))
    })

    log.Printf("WebSocket server starting on :%s", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}