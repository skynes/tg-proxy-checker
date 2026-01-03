# Telegram MTProto Proxy Verifier

A Node.js CLI tool that verifies Telegram MTProto proxies using the official TDLib API.

## Features

- Verifies proxies by actually communicating with Telegram servers
- Uses TDLib's `addProxy` and `pingProxy` methods
- Works without authorization (no login required)
- Supports both `tg://` and `https://t.me/proxy` URL formats
- Handles hex and base64 secret formats automatically
- Scriptable with proper exit codes

## Installation

```bash
npm init -y
npm install tdl tdl-tdlib-addon
```

## Usage

### As command line argument:
```bash
node index.js "https://t.me/proxy?server=IP&port=PORT&secret=SECRET"
```

or

```bash
node index.js "tg://proxy?server=IP&port=PORT&secret=SECRET"
```

### From stdin:
```bash
echo "https://t.me/proxy?server=IP&port=PORT&secret=SECRET" | node index.js
```

### Debug mode:
```bash
node index.js --debug "https://t.me/proxy?server=IP&port=PORT&secret=SECRET"
```

## Exit Codes

- `0` - Proxy verification successful (OK)
- `1` - Invalid secret format (INVALID_SECRET)
- `2` - Proxy verification failed (NO)

## Output

- `OK` - Proxy is working
- `NO` - Proxy is not working
- `INVALID_SECRET` - Secret could not be decoded

With `--debug` flag, additional information is printed to stderr:
- Server and port
- Secret format (hex or base64)
- Decoded byte length
- First 32 characters of hex secret
- TDLib error messages (if any)

## Example

```bash
node index.js "https://t.me/proxy?server=163.5.31.10&port=8443&secret=EERighJJvXrFGRMCIMJdCQRueWVrdGFuZXQuY29tZmFyYWthdi5jb212YW4ubmFqdmEuY29tAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
```

## How It Works

1. Parses the proxy URL to extract server, port, and secret
2. Normalizes the secret:
   - If secret contains only hex characters [0-9a-fA-F], treats it as hex
   - Otherwise, treats it as URL-safe Base64
   - Normalizes Base64: `-` → `+`, `_` → `/`
   - Adds padding (`=`) to make length a multiple of 4
   - Decodes to raw bytes
   - Converts bytes to lowercase hex string
3. Creates a TDLib client (no authorization required)
4. Calls `addProxy` with the normalized secret
5. Calls `pingProxy` to verify connectivity
6. Returns result based on pingProxy success/failure

## Requirements

- Node.js ≥ 18
- Linux / WSL (TDLib binaries are platform-specific)
- Internet connection for TDLib downloads

## Notes

- TDLib will download necessary binaries on first run
- The tool uses TDLib's ability to add and ping proxies before authorization
- Timeout is set to 12 seconds for proxy ping


