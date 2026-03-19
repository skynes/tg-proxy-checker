# Docker: сборка, публикация и запуск

**Исходный Node.js проект:** [telegram-mtproto-proxy-checker](https://github.com/AmirTahaMim/telegram-mtproto-proxy-checker) (оригинальный репозиторий).

---

## Запуск одной командой на любом сервере

Если образ уже опубликован в Docker Hub, на **любом сервере** с установленным Docker достаточно:

```bash
docker run -d -p 1227:1227 --name tg-proxy-checker --restart unless-stopped skynesdev/tg-proxy-checker:latest
```

Проверка:
```bash
curl "http://127.0.0.1:1227?link=https%3A%2F%2Ft.me%2Fproxy%3Fserver%3D1.2.3.4%26port%3D443%26secret%3Dtest"
```

Остановка:
```bash
docker stop tg-proxy-checker && docker rm tg-proxy-checker
```

---

## Публикация образа в Docker Hub (один раз)

Делается на машине, где есть собранный проект и аккаунт Docker Hub.

### 1. Регистрация

- Зарегистрируйтесь на [Docker Hub](https://hub.docker.com/) (если ещё нет).
- Создайте репозиторий с именем `tg-proxy-checker` или используйте автоматическое создание при первом push.

### 2. Вход и публикация

```bash
cd /var/www/tg-proxy-checker

# Вход (введёте логин и пароль)
docker login

# Сборка с тегом для Docker Hub
docker build -t skynesdev/tg-proxy-checker:latest .

# Публикация
docker push skynesdev/tg-proxy-checker:latest
```

После этого образ будет доступен по имени `skynesdev/tg-proxy-checker:latest`, и его можно запускать одной командой `docker run ...` на любом сервере (см. выше).

### 3. Обновление образа

После изменений в коде повторите на этой же машине:

```bash
docker build -t skynesdev/tg-proxy-checker:latest .
docker push skynesdev/tg-proxy-checker:latest
```

На другом сервере для обновления:

```bash
docker pull skynesdev/tg-proxy-checker:latest
docker stop tg-proxy-checker && docker rm tg-proxy-checker
docker run -d -p 1227:1227 --name tg-proxy-checker --restart unless-stopped skynesdev/tg-proxy-checker:latest
```

---

## Альтернатива: без регистрации (образ в файле)

Если не хотите использовать Docker Hub, можно перенести образ файлом:

**На сервере, где собирали:**
```bash
docker build -t tg-proxy-checker:latest .
docker save tg-proxy-checker:latest -o tg-proxy-checker.tar
# Скопируйте tg-proxy-checker.tar на другой сервер (scp, rsync и т.д.)
```

**На другом сервере:**
```bash
docker load -i tg-proxy-checker.tar
docker run -d -p 1227:1227 --name tg-proxy-checker --restart unless-stopped tg-proxy-checker:latest
```

Минус: при каждом обновлении нужно снова делать save и копировать файл.
