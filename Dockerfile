# Stage 1: install deps (native addon needs build tools)
FROM node:20-bookworm AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: run
FROM node:20-bookworm-slim

LABEL org.opencontainers.image.title="tg-proxy-checker"
LABEL org.opencontainers.image.description="HTTP API to check Telegram MTProto and SOCKS5 proxies via TDLib. Port 1227."
LABEL org.opencontainers.image.source="https://github.com/skynes/tg-proxy-checker"
LABEL org.opencontainers.image.documentation="https://github.com/skynes/tg-proxy-checker/blob/main/DOCKER.md"
LABEL org.opencontainers.image.url="https://hub.docker.com/r/skynesdev/tg-proxy-checker"

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY lib ./lib
COPY server.js ./

ENV PORT=1227
ENV MAX_CONCURRENT=3
EXPOSE 1227

CMD ["node", "server.js"]
