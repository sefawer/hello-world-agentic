package hub

import (
    "testing"
    "time"
)

func TestNewHub(t *testing.T) {
    hub := NewHub()
    if hub == nil {
        t.Error("Hub oluşturulamadı")
    }
}

func TestHubBroadcast(t *testing.T) {
    hub := NewHub()
    go hub.Run()

    // Broadcast kanalına mesaj gönder
    go func() {
        hub.BroadcastMessage("test", time.Now())
    }()

    // Mesajın iletilip iletilmediğini kontrol et
    select {
    case <-hub.broadcast:
        // Başarılı
    case <-time.After(1 * time.Second):
        t.Error("Broadcast timeout")
    }
}