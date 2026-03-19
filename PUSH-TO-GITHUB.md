# Публикация в GitHub (skynes/tg-proxy-checker)

## 1. Создать репозиторий на GitHub

1. Открой: **https://github.com/organizations/skynes/repositories/new**  
   (или зайди в [github.com/skynes](https://github.com/skynes) → **Repositories** → **New**)
2. **Repository name:** `tg-proxy-checker`
3. **Visibility:** Public
4. **НЕ** ставь галочки "Add a README", ".gitignore", "License" — репозиторий должен быть **пустой**
5. Нажми **Create repository**

## 2. На сервере: закоммитить и запушить

Выполни в терминале:

```bash
cd /var/www/tg-proxy-checker

# Все файлы в коммит
git add -A
git status
git commit -m "tg-proxy-checker: HTTP API, SOCKS5, Docker"

# Подключить репо skynes (старый origin — оригинал — переименуем в upstream)
git remote rename origin upstream
git remote add origin https://github.com/skynes/tg-proxy-checker.git

# Отправить в GitHub
git push -u origin main
```

Если попросит логин/пароль — используй свой GitHub-аккаунт. Для пароля лучше создать **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens) и ввести его вместо пароля.

После этого код будет в **https://github.com/skynes/tg-proxy-checker**.

## Дальше

Клонирование на другом компьютере:
```bash
git clone https://github.com/skynes/tg-proxy-checker.git
cd tg-proxy-checker
npm install
```

Обновление из своего репо:
```bash
git pull origin main
```
