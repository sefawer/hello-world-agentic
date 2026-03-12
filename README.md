# Hello World Agentic Projesi

Real-time WebSocket ile çalışan, Docker container'larda koşan bir "Hello World" uygulaması.

## Teknolojiler

- Backend API: Python FastAPI
- WebSocket: Go + Gorilla WebSocket
- Frontend: React + TypeScript + TailwindCSS
- Database: PostgreSQL
- Container: Docker + Docker Compose
- CI/CD: GitHub Actions

## Kurulum

git clone https://github.com/sefawer/hello-world-agentic.git
cd hello-world-agentic
cp .env.example .env
docker-compose up -d

## Servisler

- Frontend: http://localhost:3000
- API Dokümantasyonu: http://localhost:8000/docs
- WebSocket: ws://localhost:8001
- Database: localhost:5432

## Test

cd services/api && pytest
cd services/websocket && go test
cd services/frontend && npm test

## Mimari

Frontend (React) -- REST --> API (FastAPI) -- DB --> PostgreSQL
      |
      +-- WebSocket --> Go WebSocket -- Broadcast --> Tüm İstemciler

## License

MIT