# Feature: Hello World Butonu ve Real-time Mesajlaşma

## Epic
Temel Real-time İletişim Altyapısı

## Story
Bir kullanıcı olarak, paneldeki butona tıkladığımda, tüm bağlı istemcilere "Hello World" mesajının gitmesini istiyorum.

## Kabul Kriterleri

### AC1: Frontend Buton
- Panelde "Say Hello!" butonu olmalı
- Buton mavi renkte olmalı
- Tıklanınca loading göstermeli

### AC2: API Entegrasyonu
- POST /api/messages endpoint'ine istek gitmeli
- Body: { "content": "Hello World" }
- Response: id ve timestamp dönmeli

### AC3: Veritabanı Kaydı
- Her mesaj veritabanına kaydedilmeli
- Son 10 mesaj sayfa yenilenince görünmeli

### AC4: WebSocket Broadcast
- API mesajı Go WebSocket'e iletmeli
- Go WebSocket tüm client'lara broadcast yapmalı

### AC5: Frontend Güncelleme
- Gelen mesajlar listede görünmeli
- Her mesajda timestamp olmalı

### AC6: Çoklu İstemci
- İki browser açıkken biri tıklayınca diğeri görmeli

### AC7: Bağlantı
- WebSocket kopunca reconnect olmalı
- Bağlantı durumu gösterilmeli

## Teknik Detaylar

POST /api/messages
Request: { "content": "Hello World" }
Response: { "id": "uuid", "content": "Hello World", "timestamp": "2024-01-01T12:00:00Z" }

WebSocket
- Bağlantı: ws://localhost:8001/ws
- Mesaj: { "type": "new_message", "data": { "id": "...", "content": "...", "timestamp": "..." } }

Database
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    sender_ip TEXT
);

## UI

+----------------------------------+
|  Hello World Panel               |
|  [ SAY HELLO! ]                  |
|                                  |
|  Mesajlar:                       |
|  12:00:01 - Hello World          |
|  12:00:00 - Hello World          |
|                                  |
|  Bağlantı: Aktif                 |
+----------------------------------+

## Testler

1. Tek client: Butona tıkla -> mesaj gelsin
2. Çift client: Birinde tıkla -> diğerinde görünsün
3. Kopma: WiFi kapat/aç -> reconnect olsun
4. Hata: API kapalıyken tıkla -> hata mesajı