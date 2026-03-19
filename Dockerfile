# Stage 1: install deps (native addon needs build tools)
FROM node:20-bookworm AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: run
FROM node:20-bookworm-slim

LABEL org.opencontainers.image.title="tg-proxy-checker"
LABEL org.opencontainers.image.description="HTTP API to check Telegram proxies (MTProto and SOCKS5). GET ?link=<url> returns {status:1, ping:ms} or {status:0, error}. Port 1227."
LABEL org.opencontainers.image.source="https://github.com/AmirTahaMim/telegram-mtproto-proxy-checker"

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY lib ./lib
COPY server.js ./

ENV PORT=1227
EXPOSE 1227

CMD ["node", "server.js"]
