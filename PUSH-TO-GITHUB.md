# Publishing to GitHub (skynes/tg-proxy-checker)

## 1. Create the repository on GitHub

1. Open **https://github.com/organizations/skynes/repositories/new**  
   (or go to [github.com/skynes](https://github.com/skynes) → **Repositories** → **New**)
2. **Repository name:** `tg-proxy-checker`
3. **Visibility:** Public
4. **Do not** check "Add a README", ".gitignore", or "License" — the repository should be **empty**
5. Click **Create repository**

## 2. On the server: commit and push

Run in the terminal:

```bash
cd /var/www/tg-proxy-checker

git add -A
git status
git commit -m "tg-proxy-checker: HTTP API, SOCKS5, Docker"

# Point origin to skynes repo (rename current origin to upstream if it was the original)
git remote rename origin upstream
git remote add origin https://github.com/skynes/tg-proxy-checker.git

git push -u origin main
```

If prompted for login/password, use your GitHub account. For password, use a **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens) instead of your account password.

The code will then be at **https://github.com/skynes/tg-proxy-checker**.

## Next steps

Clone on another machine:
```bash
git clone https://github.com/skynes/tg-proxy-checker.git
cd tg-proxy-checker
npm install
```

Pull updates:
```bash
git pull origin main
```
