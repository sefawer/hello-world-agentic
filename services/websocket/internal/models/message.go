package models

import "time"

type Message struct {
    ID        string    `json:"id"`
    Content   string    `json:"content"`
    Timestamp time.Time `json:"timestamp"`
}

type BroadcastRequest struct {
    Content   string    `json:"content"`
    Timestamp time.Time `json:"timestamp"`
}

type WebSocketMessage struct {
    Type string  `json:"type"`
    Data Message `json:"data"`
}

type HeartbeatMessage struct {
    Type      string    `json:"type"`
    Timestamp time.Time `json:"timestamp"`
}