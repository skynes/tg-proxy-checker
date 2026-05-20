# Docker: build, publish, and run

**Image on Docker Hub:** [skynesdev/tg-proxy-checker](https://hub.docker.com/r/skynesdev/tg-proxy-checker)

**Original Node.js project:** [telegram-mtproto-proxy-checker](https://github.com/AmirTahaMim/telegram-mtproto-proxy-checker).

---

## Docker Hub repository page (overview)

The Hub page currently has no overview. After each release, update it:

1. Open [skynesdev/tg-proxy-checker](https://hub.docker.com/r/skynesdev/tg-proxy-checker) → **Settings** (gear) or **Edit repository**.
2. **Short description** (optional, ~150 chars):
   ```
   HTTP API to verify Telegram MTProto & SOCKS5 proxies via TDLib. Port 1227.
   ```
3. **Full description:** copy the Docker section from [README.md](README.md) (or the whole README) into the overview field and save.

**Alternative:** connect the GitHub repo `skynes/tg-proxy-checker` in Docker Hub → **Build & Deploy** / **GitHub** so the Hub page syncs `README.md` from `main`.

---

## One-command run on any server

If the image is already published on Docker Hub, on **any server** with Docker installed:

```bash
docker run -d -p 1227:1227 --name tg-proxy-checker --restart unless-stopped skynesdev/tg-proxy-checker:latest
```

Optional: `MAX_CONCURRENT` (default `3`) — how many proxy checks run in parallel. Each check uses its own temp TDLib folder.

Test:
```bash
curl -G "http://127.0.0.1:1227" \
  --data-urlencode "link=https://t.me/proxy?server=tg3.f2p.ms&port=442&secret=eedeadbeefcafebabefeedfacef0e0d0c07777772e6170706c652e636f6d"
```

Stop:
```bash
docker stop tg-proxy-checker && docker rm tg-proxy-checker
```

---

## Publishing the image to Docker Hub (one-time)

On the machine where the project is built and you have a Docker Hub account.

### 1. Registration

- Sign up at [Docker Hub](https://hub.docker.com/) if needed.
- Create a repository named `tg-proxy-checker`, or let it be created on first push.

### 2. Login and publish

```bash
cd /var/www/tg-proxy-checker

docker login

docker build -t skynesdev/tg-proxy-checker:latest .

docker push skynesdev/tg-proxy-checker:latest
```

The image will be available as `skynesdev/tg-proxy-checker:latest` and can be run with the command above on any server.

### 3. Updating the image

After code changes, on the build machine:

```bash
docker build -t skynesdev/tg-proxy-checker:latest .
docker push skynesdev/tg-proxy-checker:latest
```

On another server to update:

```bash
docker pull skynesdev/tg-proxy-checker:latest
docker stop tg-proxy-checker && docker rm tg-proxy-checker
docker run -d -p 1227:1227 --name tg-proxy-checker --restart unless-stopped skynesdev/tg-proxy-checker:latest
```

---

## Alternative: without Docker Hub (image as file)

To move the image without a registry:

**On the build machine:**
```bash
docker build -t tg-proxy-checker:latest .
docker save tg-proxy-checker:latest -o tg-proxy-checker.tar
# Copy tg-proxy-checker.tar to the other server (scp, rsync, etc.)
```

**On the other server:**
```bash
docker load -i tg-proxy-checker.tar
docker run -d -p 1227:1227 --name tg-proxy-checker --restart unless-stopped tg-proxy-checker:latest
```

Downside: you need to save and copy the file again for each update.
