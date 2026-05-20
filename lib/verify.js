'use strict';

const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const tdl = require('tdl');
const { getTdjson } = require('prebuilt-tdlib');

try {
  tdl.configure({ tdjson: getTdjson() });
} catch (_) {
  // fallback to system libtdjson
}

/** Supported proxy link formats (path prefix before '?') */
const MTPROTO_PATTERNS = [
  /^tg:\/\/proxy\?/i,
  /^https?:\/\/(www\.)?(t\.me|telegram\.me|telegram\.dog)\/proxy\?/i,
];
const SOCKS_PATTERNS = [
  /^tg:\/\/socks\?/i,
  /^https?:\/\/(www\.)?(t\.me|telegram\.me|telegram\.dog)\/socks\?/i,
];

/**
 * Parse Telegram proxy URL. Returns { type, server, port, ... } for MTProto or SOCKS5.
 * @returns {{ type: 'mtproto', server: string, port: number, secret: string } | { type: 'socks5', server: string, port: number, username?: string, password?: string }}
 */
function parseProxyUrl(url) {
  const trimmed = (url || '').trim();
  const qIdx = trimmed.indexOf('?');
  if (qIdx < 0) {
    throw new Error('Invalid proxy URL format');
  }
  const queryString = trimmed.slice(qIdx + 1);
  const params = new URLSearchParams(queryString);

  const server = params.get('server');
  const port = parseInt(params.get('port'), 10);

  if (!server || !server.trim()) {
    throw new Error('Missing required parameter: server');
  }
  if (!params.has('port') || isNaN(port) || port < 1 || port > 65535) {
    throw new Error('Missing or invalid parameter: port');
  }

  for (const re of MTPROTO_PATTERNS) {
    if (re.test(trimmed)) {
      const secret = params.get('secret');
      if (!secret || !secret.trim()) {
        throw new Error('Missing required parameter: secret (MTProto)');
      }
      return { type: 'mtproto', server: server.trim(), port, secret: secret.trim() };
    }
  }

  for (const re of SOCKS_PATTERNS) {
    if (re.test(trimmed)) {
      const username = params.get('user') ?? params.get('username') ?? '';
      const password = params.get('pass') ?? params.get('password') ?? '';
      return {
        type: 'socks5',
        server: server.trim(),
        port,
        username: String(username).trim(),
        password: String(password).trim(),
      };
    }
  }

  throw new Error('Invalid proxy URL format: expected tg://proxy?, t.me/proxy?, tg://socks?, or t.me/socks?');
}

function normalizeSecret(secret) {
  const hexPattern = /^[0-9a-fA-F]+$/;
  const isHex = hexPattern.test(secret);

  let bytes;

  if (isHex) {
    if (secret.length % 2 !== 0) {
      throw new Error('INVALID_SECRET');
    }
    try {
      bytes = Buffer.from(secret, 'hex');
    } catch (error) {
      throw new Error('INVALID_SECRET');
    }
  } else {
    let normalized = secret.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4;
    if (padding !== 0) {
      normalized += '='.repeat(4 - padding);
    }
    try {
      bytes = Buffer.from(normalized, 'base64');
    } catch (error) {
      throw new Error('INVALID_SECRET');
    }
  }

  return bytes.toString('hex').toLowerCase();
}

function extractErrorMessage(error) {
  let errorMsg = 'Unknown error';
  const errorStr = JSON.stringify(error);

  // tdl@8 rejects with TDLibError { code, message }
  if (error && typeof error.code === 'number' && error.message) {
    const code = error.code;
    const msg = error.message;
    errorMsg = `Error ${code}: ${msg}`;
    if (code === 400) {
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes('secret')) {
        errorMsg = 'INVALID_SECRET: Secret format is invalid or incorrect';
      } else if (lowerMsg.includes('port')) {
        errorMsg = 'INVALID_PORT: Port number is invalid or out of range';
      } else if (lowerMsg.includes('server') || lowerMsg.includes('hostname')) {
        errorMsg = 'INVALID_SERVER: Server address is invalid or unreachable';
      } else {
        errorMsg = `INVALID_PROXY: ${msg}`;
      }
    } else if (code === 406 || code === 401) {
      errorMsg = 'CONNECTION_FAILED: Could not establish connection to proxy server';
    } else if (code === 500 || code === 503) {
      errorMsg = 'PROXY_ERROR: Proxy server returned an error or is unavailable';
    }
    return errorMsg;
  }

  if (error.response) {
    const response = error.response;
    if (response._ === 'error') {
      const code = response.code;
      const msg = response.message || '';
      errorMsg = `Error ${code}: ${msg}`;
      if (code === 400) {
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('secret')) {
          errorMsg = 'INVALID_SECRET: Secret format is invalid or incorrect';
        } else if (lowerMsg.includes('port')) {
          errorMsg = 'INVALID_PORT: Port number is invalid or out of range';
        } else if (lowerMsg.includes('server') || lowerMsg.includes('hostname')) {
          errorMsg = 'INVALID_SERVER: Server address is invalid or unreachable';
        } else {
          errorMsg = `INVALID_PROXY: ${msg}`;
        }
      } else if (code === 406 || code === 401) {
        errorMsg = 'CONNECTION_FAILED: Could not establish connection to proxy server';
      } else if (code === 500 || code === 503) {
        errorMsg = 'PROXY_ERROR: Proxy server returned an error or is unavailable';
      } else {
        errorMsg = `Error ${code}: ${msg || 'Unknown TDLib error'}`;
      }
    } else if (typeof response === 'string') {
      errorMsg = response;
    } else if (response.error) {
      errorMsg = response.error.message || JSON.stringify(response.error);
    } else if (response.message) {
      errorMsg = response.message;
    }
  }

  if (error.message) {
    const msg = error.message;
    if (msg.includes('Timeout') || msg.includes('timeout')) {
      errorMsg = 'TIMEOUT: Proxy did not respond within 15 seconds';
    } else if (msg.includes('ECONNREFUSED') || msg.includes('Connection refused')) {
      errorMsg = 'CONNECTION_REFUSED: Proxy server refused the connection (server might be down or port is closed)';
    } else if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo') || msg.includes('DNS')) {
      errorMsg = 'DNS_ERROR: Cannot resolve server hostname to IP address';
    } else if (msg.includes('ETIMEDOUT') || msg.includes('timed out')) {
      errorMsg = 'TIMEOUT: Connection to proxy server timed out';
    } else if (msg.includes('EHOSTUNREACH') || msg.includes('No route to host')) {
      errorMsg = 'NETWORK_ERROR: No route to proxy server';
    } else if (msg.includes('ECONNRESET') || msg.includes('Connection reset')) {
      errorMsg = 'CONNECTION_RESET: Connection to proxy server was reset';
    } else if (msg.includes('EPIPE') || msg.includes('Broken pipe')) {
      errorMsg = 'CONNECTION_RESET: Broken pipe';
    } else if (msg.includes('auth') || msg.includes('Authentication')) {
      errorMsg = 'AUTH_FAILED: Proxy authentication failed (check user/pass for SOCKS5)';
    } else if (!error.response) {
      errorMsg = msg;
    }
  }

  if (errorMsg === 'Unknown error' && errorStr) {
    const msgMatch = errorStr.match(/"message":\s*"([^"]+)"/);
    if (msgMatch) {
      errorMsg = msgMatch[1];
    } else if (errorStr.length < 200) {
      errorMsg = errorStr;
    }
  }

  return errorMsg;
}

/**
 * Build TDLib proxy type object for addProxy.
 */
function buildProxyType(parsed) {
  if (parsed.type === 'mtproto') {
    return {
      _: 'proxyTypeMtproto',
      secret: parsed.hexSecret
    };
  }
  if (parsed.type === 'socks5') {
    return {
      _: 'proxyTypeSocks5',
      username: parsed.username || '',
      password: parsed.password || ''
    };
  }
  throw new Error('Unsupported proxy type: ' + (parsed.type || 'unknown'));
}

/**
 * Verify proxy (MTProto or SOCKS5). Returns { success: true, ping } or { success: false, error }.
 * @param parsed - result of parseProxyUrl() (for mtproto must include hexSecret)
 * @param timeoutMs
 */
async function verifyProxy(parsed, timeoutMs = 15000) {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tg-proxy-'));
  const databaseDirectory = path.join(workDir, 'db');
  const filesDirectory = path.join(workDir, 'files');
  await fs.mkdir(databaseDirectory, { recursive: true });
  await fs.mkdir(filesDirectory, { recursive: true });

  const client = tdl.createClient({
    apiId: 12345,
    apiHash: '0123456789abcdef0123456789abcdef',
    useTestDc: false,
    databaseDirectory,
    filesDirectory,
  });

  try {
    const proxy = {
      _: 'proxy',
      server: parsed.server,
      port: parsed.port,
      type: buildProxyType(parsed)
    };

    const timeoutSec = Math.max(1, Math.ceil(timeoutMs / 1000));
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), timeoutMs);
    });

    // testProxy: real request to Telegram via proxy (rejects dead/wrong hosts).
    // pingProxy(proxy): must use proxy object; proxy_id after addProxy gives false OK.
    const checkPromise = (async () => {
      await client.invoke({
        _: 'testProxy',
        proxy,
        dc_id: 1,
        timeout: timeoutSec
      });
      const pingResult = await client.invoke({
        _: 'pingProxy',
        proxy
      });
      return pingResult;
    })();

    const pingResult = await Promise.race([checkPromise, timeoutPromise]);

    if (pingResult._ === 'seconds' && typeof pingResult.seconds === 'number') {
      return { success: true, ping: Math.round(pingResult.seconds * 1000) };
    }
    return { success: false, error: 'Unexpected pingProxy response' };
  } catch (error) {
    const errorMsg = extractErrorMessage(error);
    if (error.message && (error.message.includes('tdjson') || error.message.includes('TDLib'))) {
      return { success: false, error: `TDLIB_ERROR: ${errorMsg}` };
    }
    return { success: false, error: errorMsg };
  } finally {
    try {
      await client.close();
    } catch (_) {
      // ignore
    }
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch (_) {
      // ignore
    }
  }
}

/**
 * Parse URL and prepare for verifyProxy. For mtproto, normalizes secret to hex.
 * @param url - full proxy link
 * @returns parsed object ready for verifyProxy (includes hexSecret for mtproto)
 */
function parseAndPrepare(url) {
  const parsed = parseProxyUrl(url);
  if (parsed.type === 'mtproto') {
    parsed.hexSecret = normalizeSecret(parsed.secret);
  }
  if (parsed.type === 'socks5') {
    parsed.username = parsed.username || '';
    parsed.password = parsed.password || '';
  }
  return parsed;
}

module.exports = {
  parseProxyUrl,
  parseAndPrepare,
  normalizeSecret,
  extractErrorMessage,
  verifyProxy,
  buildProxyType
};
