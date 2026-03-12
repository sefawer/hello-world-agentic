-- services/database/init/01-init.sql

-- Tablo varsa düşür (development için)
DROP TABLE IF EXISTS messages;

-- Mesaj tablosunu oluştur
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sender_ip VARCHAR(255) NOT NULL
);

-- Hızlı sorgular için index
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);

-- Test verisi ekle (opsiyonel)
INSERT INTO messages (content, sender_ip) VALUES 
    ('Hello World', '127.0.0.1'),
    ('Hello World', '127.0.0.1'),
    ('Hello World', '127.0.0.1');