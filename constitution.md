# Hello World Agentic Projesi - Anayasa (Constitution)

Bu belge, projenin tüm AI ajanları ve geliştiriciler için bağlayıcı kurallarını tanımlar.

## 1. Teknoloji Yığını

### 1.1 Backend (API)
- Dil: Python 3.11+
- Framework: FastAPI (REST API için)
- API Dokümantasyonu: OpenAPI (Swagger) otomatik oluşturulacak

### 1.2 WebSocket Servisi
- Dil: Go 1.21+
- Framework: Gorilla WebSocket
- Package: github.com/gorilla/websocket

### 1.3 Frontend (Panel)
- Dil: TypeScript 5.0+
- Framework: React 18+ (Vite ile kurulacak)
- State Management: React Context API
- UI Kütüphanesi: TailwindCSS
- WebSocket Client: Native WebSocket API

### 1.4 Veritabanı
- Sistem: PostgreSQL 15+
- Driver: asyncpg (Python)
- ORM: SQLAlchemy 2.0+ (async)
- Migration: Alembic

### 1.5 Containerization
- Container Runtime: Docker
- Orkestrasyon: Docker Compose
- Image Registry: GitHub Container Registry (ghcr.io)

## 2. Proje Mimarisi

hello-world-agentic/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── docker-build.yml
├── docs/
│   ├── architecture/
│   ├── api/
│   └── specs/
│       └── 001-hello-world-button.md
├── services/
│   ├── api/                      (Python FastAPI)
│   │   ├── src/
│   │   │   ├── __init__.py
│   │   │   ├── main.py
│   │   │   ├── database.py
│   │   │   ├── models.py
│   │   │   ├── schemas.py
│   │   │   └── routers/
│   │   │       └── messages.py
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── .env.example
│   ├── websocket/                 (Go WebSocket)
│   │   ├── cmd/
│   │   │   └── server/
│   │   │       └── main.go
│   │   ├── internal/
│   │   │   ├── hub/
│   │   │   │   ├── hub.go
│   │   │   │   └── client.go
│   │   │   └── models/
│   │   │       └── message.go
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── Dockerfile
│   │   └── .env.example
│   ├── frontend/                   (React TypeScript)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── HelloButton.tsx
│   │   │   │   └── MessageList.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useWebSocket.ts
│   │   │   ├── services/
│   │   │   │   └── api.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── Dockerfile
│   │   └── .env.example
│   └── database/
│       └── init/
│           └── 01-init.sql
├── docker-compose.yml
├── constitution.md
├── .env.example
├── .gitignore
└── README.md

## 3. Servisler Arası İletişim

### 3.1 İletişim Diyagramı
[Frontend (Port 3000)] --- REST --> [API (Port 8000)] --- DB --> [PostgreSQL (Port 5432)]
       |
       +--- WebSocket --> [Go WebSocket (Port 8001)]
                              |
                              +--- Broadcast to all connected clients

### 3.2 Veri Akışı
1. Frontend butona tıklar -> POST /api/messages (API'ye)
2. API:
   - Mesajı veritabanına kaydeder
   - Go WebSocket servisine HTTP POST ile mesajı iletir
3. Go WebSocket:
   - Gelen mesajı alır
   - Bağlı tüm istemcilere broadcast eder
4. Frontend:
   - WebSocket üzerinden mesajı alır
   - Ekranda listeye ekler

### 3.3 API Endpoints

REST (Python FastAPI)
- POST /api/messages - Yeni mesaj gönder
- GET /api/messages - Son 10 mesajı getir
- GET /api/health - Health check

Internal (API -> Go WebSocket)
- POST http://websocket:8001/api/broadcast
- Body: { "content": "Hello World", "timestamp": "2024-01-01T12:00:00Z" }

### 3.4 WebSocket Events
- Client -> Server: Bağlantı kurulduğunda otomatik subscribe
- Server -> Client:
  - { "type": "new_message", "data": { "content": "...", "timestamp": "..." } }
  - { "type": "heartbeat", "data": { "timestamp": "..." } }

## 4. Veri Modelleri

### 4.1 Message Model (Python/SQLAlchemy)
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    sender_ip = Column(String, nullable=True)

### 4.2 Message Schema (Pydantic)
class MessageResponse(BaseModel):
    id: UUID
    content: str
    timestamp: datetime

class MessageCreate(BaseModel):
    content: str = "Hello World"

### 4.3 Go Message Model
type Message struct {
    ID        string    `json:"id"`
    Content   string    `json:"content"`
    Timestamp time.Time `json:"timestamp"`
}

type BroadcastRequest struct {
    Content   string    `json:"content"`
    Timestamp time.Time `json:"timestamp"`
}

### 4.4 Database Schema (SQL)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sender_ip INET
);

CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);

## 5. Geliştirme Standartları

### 5.1 Python
- Format: Black (line length: 88)
- Lint: Ruff
- Type Hints: Zorunlu
- Test: pytest (minimum %80 coverage)

### 5.2 Go
- Format: go fmt
- Lint: golangci-lint
- Dependency: Go modules
- Test: go test -race

### 5.3 TypeScript/React
- Format: Prettier
- Lint: ESLint
- Type Safety: Strict mode
- Test: Vitest

### 5.4 Git
- Branch: main + feature/*
- Commits: Conventional Commits
- PR: En az 1 onay, tüm testler geçmeli

## 6. Container Standartları

### 6.1 Python API Dockerfile
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY src/ ./src/
ENV PATH=/root/.local/bin:$PATH
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

### 6.2 Go WebSocket Dockerfile
FROM golang:1.21-alpine as builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o websocket-server ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /app/websocket-server .
CMD ["./websocket-server"]

### 6.3 React Frontend Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

## 7. Agentik Çalışma Kuralları

### 7.1 AI Ajanları İçin Kurallar
1. Önce Spesifikasyon, Sonra Kod: Her feature için önce spec yazılacak
2. Constitution'a Sadakat: Tüm kod bu anayasaya uygun olacak
3. Test Şart: Her yeni özellik için test yazılacak
4. Dokümantasyon: Tüm public API'ler docstring ile açıklanacak

### 7.2 İş Akışı
1. Feature branch oluştur: feature/001-hello-button
2. /docs/specs/ klasörüne feature spec yaz
3. Spec onayı al (human review)
4. Kodu yaz (AI + human)
5. Testleri yaz ve çalıştır
6. PR oluştur
7. CI/CD geçtikten sonra merge

## 8. Başarı Kriterleri

- [ ] Tüm servisler docker-compose up ile tek komutta ayağa kalkmalı
- [ ] Frontend'de butona tıklayınca mesaj tüm bağlı istemcilere gitmeli
- [ ] Her mesaj timestamp ile birlikte veritabanına kaydedilmeli
- [ ] WebSocket bağlantısı kopunca otomatik reconnect olmalı
- [ ] API dokümantasyonu (Swagger) /docs adresinde erişilebilir olmalı
- [ ] Tüm servislerin health endpoint'i olmalı
- [ ] Go WebSocket servisi en az 100 concurrent bağlantıyı kaldırabilmeli