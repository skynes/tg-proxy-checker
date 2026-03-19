# Как сохранить код и продолжить разработку

## Вариант 1: Свой репозиторий на GitHub (рекомендуется)

### 1. Создай репозиторий на GitHub
- Зайди на [github.com/new](https://github.com/new)
- Имя, например: **tg-proxy-checker**
- Public, **без** README / .gitignore (репозиторий должен быть пустой)
- Create repository

### 2. На сервере (в папке проекта)

```bash
cd /var/www/tg-proxy-checker

# Все изменения и новые файлы — в коммит
git add -A
git status   # проверь список
git commit -m "tg-proxy-checker: HTTP API, SOCKS5, Docker, DOCKER.md"

# Подставь СВОЙ логин и имя репо (например luckycoders/tg-proxy-checker)
git remote rename origin upstream
git remote add origin https://github.com/skynes/tg-proxy-checker.git

git push -u origin main
```

Если репозиторий на GitHub уже есть и в нём есть коммиты (например, README), лучше так:

```bash
git remote add myorigin https://github.com/skynes/tg-proxy-checker.git
git push -u myorigin main
```

Дальше работаешь как обычно: `git add`, `git commit`, `git push origin main`.

---

## Вариант 2: Форк исходного репозитория

Если хочешь держать связь с [оригиналом](https://github.com/AmirTahaMim/telegram-mtproto-proxy-checker):

1. На GitHub нажми **Fork** у этого репо — появится копия у тебя (например `luckycoders/telegram-mtproto-proxy-checker`).
2. Локально добавь свой форк и запушь:

```bash
cd /var/www/tg-proxy-checker
git add -A
git commit -m "HTTP API, SOCKS5, Docker"
git remote add myfork https://github.com/LOGIN/telegram-mtproto-proxy-checker.git
git push -u myfork main
```

---

## Продолжить разработку на другом компьютере

После того как код в твоём GitHub:

```bash
git clone https://github.com/skynes/tg-proxy-checker.git
cd tg-proxy-checker
npm install
```

Дальше правишь код, коммиты, пуши — всё хранится в репозитории.
