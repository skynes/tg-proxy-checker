# Telegram Proxy Checker

A Node.js CLI and HTTP API that verifies Telegram proxies (MTProto and SOCKS5) by actually communicating with Telegram servers using the official TDLib API.

## Features

- ✅ **Real Verification**: Verifies proxies by actually communicating with Telegram servers, not just TCP connections
- ✅ **MTProto & SOCKS5**: Supports both MTProxy and SOCKS5 proxy types
- ✅ **Uses TDLib**: Official Telegram Database Library API (`addProxy` and `pingProxy` methods)
- ✅ **No Authorization Required**: Works before login - no phone number or bot token needed
- ✅ **Multiple URL Formats**: All official Telegram deep-link formats (`tg://` and `t.me`, see below)
- ✅ **Smart Secret Handling**: Auto-detects and converts hex/base64 secrets (MTProto)
- ✅ **Detailed Error Messages**: Shows specific failure reasons (connection refused, timeout, invalid secret, etc.)
- ✅ **Scriptable**: Proper exit codes for automation
- ✅ **Cross-Platform**: Works on Windows, Linux, and macOS

## Supported proxy link formats

The checker accepts the same link formats that Telegram clients use. You can paste a link from a channel or use your own parameters.

### MTProxy (MTProto)

| Format | Example |
|--------|--------|
| `tg://proxy?server=...&port=...&secret=...` | `tg://proxy?server=1.2.3.4&port=443&secret=dd...` |
| `https://t.me/proxy?server=...&port=...&secret=...` | `https://t.me/proxy?server=1.2.3.4&port=443&secret=dd...` |
| `http://t.me/proxy?server=...&port=...&secret=...` | same with `http` |
| `https://telegram.me/proxy?server=...&port=...&secret=...` | same with `telegram.me` |
| `https://telegram.dog/proxy?server=...&port=...&secret=...` | same with `telegram.dog` |

Parameters: **server** (host or IP), **port** (number), **secret** (hex or base64).

### SOCKS5

| Format | Example |
|--------|--------|
| `tg://socks?server=...&port=...&user=...&pass=...` | `tg://socks?server=1.2.3.4&port=1080&user=myuser&pass=mypass` |
| `https://t.me/socks?server=...&port=...&user=...&pass=...` | `https://t.me/socks?server=1.2.3.4&port=1080` |
| `http://t.me/socks?server=...&port=...` | same with `http` |
| `https://telegram.me/socks?server=...&port=...` | same with `telegram.me` |
| `https://telegram.dog/socks?server=...&port=...` | same with `telegram.dog` |

Parameters: **server** (required), **port** (required), **user** (optional), **pass** (optional). For SOCKS5 without auth, omit `user` and `pass` or leave them empty.

## Installation

### Clone from GitHub

```bash
git clone https://github.com/AmirTahaMim/telegram-mtproto-proxy-checker.git
cd telegram-mtproto-proxy-checker
npm install
```

### Install Dependencies

```bash
npm install
```

This will install:
- `tdl` - Node.js wrapper for TDLib
- `tdl-tdlib-addon` - TDLib native bindings
- `prebuilt-tdlib` - Pre-built TDLib binaries for your platform

## Usage

### Basic Usage

**MTProxy:**
```bash
node index.js "https://t.me/proxy?server=IP&port=PORT&secret=SECRET"
node index.js "tg://proxy?server=IP&port=PORT&secret=SECRET"
```

**SOCKS5 (no auth):**
```bash
node index.js "https://t.me/socks?server=1.2.3.4&port=1080"
```

**SOCKS5 (with user/pass):**
```bash
node index.js "tg://socks?server=1.2.3.4&port=1080&user=myuser&pass=mypass"
```

**From stdin:**
```bash
echo "https://t.me/proxy?server=IP&port=PORT&secret=SECRET" | node index.js
```

**Debug mode (detailed output):**
```bash
node index.js --debug "https://t.me/proxy?server=IP&port=PORT&secret=SECRET"
```

### Web server (HTTP API)

Run the checker as a web server on port 1227:

```bash
npm run server
# or: node server.js
```

**Request:** `GET http://127.0.0.1:1227?link=<url-encoded-proxy-link>`

**Success response:** `{"status":1,"ping":100}`  
**Error response:** `{"status":0,"error":"..."}`

Example:
```bash
curl "http://127.0.0.1:1227?link=https%3A%2F%2Ft.me%2Fproxy%3Fserver%3D1.2.3.4%26port%3D443%26secret%3D..."
```

### Docker

**Локальная сборка и запуск:**
```bash
docker build -t tg-proxy-checker .
# или с Docker Hub: docker run -d -p 1227:1227 --name tg-proxy-checker --restart unless-stopped skynesdev/tg-proxy-checker:latest
docker run -d -p 1227:1227 --name tg-proxy-checker tg-proxy-checker:latest
```

**Запуск одной командой с Docker Hub** (если образ уже опубликован): см. [DOCKER.md](DOCKER.md).

Then: `GET http://127.0.0.1:1227?link=...` as above.

## Output

### Success
```
OK 123
```
Where `123` is the proxy ping latency in milliseconds (time from ping to Telegram servers until response).

### Failure with Detailed Error
```
NO: CONNECTION_REFUSED: Proxy server refused the connection (server might be down or port is closed)
NO: DNS_ERROR: Cannot resolve server hostname to IP address
NO: TIMEOUT: Proxy did not respond within 15 seconds
NO: Response hash mismatch
NO: INVALID_SECRET: Secret format is invalid or incorrect
```

### Invalid Secret Format
```
INVALID_SECRET
```

## Exit Codes

- `0` - Proxy verification successful (OK)
- `1` - Invalid secret format (INVALID_SECRET)
- `2` - Proxy verification failed (NO with detailed error)

## Examples

### Example 1: Working Proxy
```bash
$ node index.js "https://t.me/proxy?server=163.5.31.10&port=8443&secret=EERighJJvXrFGRMCIMJdCQRueWVrdGFuZXQuY29tZmFyYWthdi5jb212YW4ubmFqdmEuY29tAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
OK
```

### Example 2: Failed Proxy
```bash
$ node index.js "https://t.me/proxy?server=invalid.example.com&port=443&secret=abcd1234"
NO: DNS_ERROR: Cannot resolve server hostname to IP address
```

### Example 3: Debug Mode
```bash
$ node index.js --debug "https://t.me/proxy?server=example.com&port=443&secret=secret123"
[DEBUG] Parsed URL:
[DEBUG]   Server: example.com
[DEBUG]   Port: 443
[DEBUG]   Secret (raw): secret123...
[DEBUG]   Secret format: base64
[DEBUG] Connected to TDLib
[DEBUG] Server: example.com
[DEBUG] Port: 443
[DEBUG] Secret (hex, first 32 chars): b2b9b2b9b2b9b2b9b2b9b2b9b2b9b2b9...
[DEBUG] Secret length: 9 bytes
NO: CONNECTION_REFUSED: Proxy server refused the connection
```

## How It Works

1. **URL Parsing**: Detects link type (MTProxy or SOCKS5) and extracts parameters (see [Supported proxy link formats](#supported-proxy-link-formats)).
2. **MTProxy only – Secret normalization**: Secret is decoded (hex or URL-safe Base64) and converted to the format TDLib expects.
3. **TDLib Client**: Creates a TDLib client (no authorization required).
4. **Add Proxy**: Calls `addProxy` with `proxyTypeMtproto` (server, port, secret) or `proxyTypeSocks5` (server, port, username, password).
5. **Ping Proxy**: Calls `pingProxy` to verify actual connectivity to Telegram servers.
6. **Result**: Returns success with ping time (ms) or a detailed error message.

## Error Messages Explained

| Error Message | Meaning |
|--------------|---------|
| `CONNECTION_REFUSED` | Proxy server is not accepting connections (down or firewall blocking) |
| `DNS_ERROR` | Cannot resolve the server hostname |
| `TIMEOUT` | Proxy did not respond within 15 seconds |
| `Response hash mismatch` | Proxy is reachable but secret is incorrect or proxy misconfigured (MTProxy) |
| `INVALID_SECRET` | Secret format cannot be decoded (invalid hex or base64, MTProxy) |
| `AUTH_FAILED` | SOCKS5 proxy rejected username/password |
| `INVALID_PORT` | Port number is invalid or out of range |
| `INVALID_SERVER` | Server address is invalid |

## Requirements

- **Node.js** ≥ 18
- **Platform**: Windows, Linux, or macOS (TDLib binaries are platform-specific)
- **Internet Connection**: Required for initial TDLib download and proxy verification

## Technical Details

- Uses TDLib's `addProxy` and `pingProxy` methods
- Proxy verification works **before authorization** (no login required)
- Timeout is set to 15 seconds for proxy ping
- Supports long Fake-TLS Base64 secrets
- Automatically handles both hex and base64 secret formats
- TDLib binaries are automatically downloaded via `prebuilt-tdlib` package

## Troubleshooting

### "Dynamic Loading Error: Win32 error 126"
- Ensure `prebuilt-tdlib` package is installed: `npm install prebuilt-tdlib`
- On Windows, the `tdjson.dll` will be automatically downloaded

### "Cannot find module 'tdl'"
- Run `npm install` to install all dependencies

### Proxy verification times out
- Check if the proxy server is accessible
- Verify the server IP/hostname and port are correct
- Some proxies may have longer response times - this is normal

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details


