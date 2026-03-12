# Agent Task Distribution

## Ajan-1: Go WebSocket
Dosya: services/websocket/

Görevler:
- go mod init
- cmd/server/main.go yaz
- internal/hub/hub.go (connection manager)
- internal/hub/client.go (websocket client)
- internal/models/message.go
- POST /api/broadcast endpoint'i
- /ws endpoint'i
- Broadcast logic
- Dockerfile yaz

## Ajan-2: Python API
Dosya: services/api/

Görevler:
- requirements.txt (fastapi, uvicorn, sqlalchemy, asyncpg, httpx)
- src/main.py
- src/database.py (postgres bağlantısı)
- src/models.py (Message model)
- src/schemas.py (Pydantic)
- src/routers/messages.py (POST /messages, GET /messages)
- WebSocket'e HTTP POST
- Dockerfile yaz

## Ajan-3: Frontend React
Dosya: services/frontend/

Görevler:
- Vite + React + TS kur
- TailwindCSS kur
- src/types/index.ts
- src/services/api.ts (axios)
- src/hooks/useWebSocket.ts
- src/components/HelloButton.tsx
- src/components/MessageList.tsx
- src/components/ConnectionStatus.tsx
- src/App.tsx
- Dockerfile yaz

## Ajan-4: Docker Compose
Dosya: /

Görevler:
- docker-compose.yml yaz (db, api, websocket, frontend)
- services/database/init/01-init.sql (create table)
- .env.example oluştur
- Network: hello-world-net
- Volume: postgres_data

## Ajan-5: CI/CD
Dosya: .github/workflows/

Görevler:
- ci.yml (test)
- docker-build.yml
- .gitignore
- README.md