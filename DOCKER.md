# Docker: build, publish, and run

**Original Node.js project:** [telegram-mtproto-proxy-checker](https://github.com/AmirTahaMim/telegram-mtproto-proxy-checker).

---

## One-command run on any server

If the image is already published on Docker Hub, on **any server** with Docker installed:

```bash
docker run -d -p 1227:1227 --name tg-proxy-checker --restart unless-stopped skynesdev/tg-proxy-checker:latest
```

Test:
```bash
curl "http://127.0.0.1:1227?link=https%3A%2F%2Ft.me%2Fproxy%3Fserver%3D1.2.3.4%26port%3D443%26secret%3Dtest"
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
