# Build aşaması
FROM node:20-alpine AS builder

WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./
COPY tsconfig*.json ./

# Bağımlılıkları kur
RUN npm ci

# Kaynak kodunu kopyala
COPY src ./src

# Build et
RUN npm run build

# Production aşaması
FROM node:20-alpine

WORKDIR /app

# Sadece production bağımlılıklarını kopyala
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build çıktısını builder'dan kopyala
COPY --from=builder /app/dist ./dist

# Environment variables
ENV NODE_ENV=production

# STDIO transport kullanacağımız için port açmaya gerek yok
# Ama debug için expose edebiliriz
EXPOSE 9229

# Production modunda çalıştır
CMD ["npm", "run", "start:prod"]