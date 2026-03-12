FROM golang:1.21-alpine

WORKDIR /app

# Tüm dosyaları kopyala
COPY . .

# Dependency'leri indir ve build et
RUN go mod tidy
RUN go build -o /websocket-server ./cmd/server

# Binary'nin varlığını kontrol et
RUN ls -la / | grep websocket

EXPOSE 8001

# Root dizinindeki binary'yi çalıştır
CMD ["/websocket-server"]