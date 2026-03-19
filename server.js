#!/usr/bin/env node
'use strict';

const http = require('http');
const { parseAndPrepare, verifyProxy } = require('./lib/verify');

const PORT = Number(process.env.PORT) || 1227;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '', `http://127.0.0.1:${PORT}`);
  const link = url.searchParams.get('link');

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (!link || link.trim() === '') {
    res.writeHead(400);
    res.end(JSON.stringify({ status: 0, error: 'Missing link parameter' }));
    return;
  }

  const proxyUrl = decodeURIComponent(link.trim());

  try {
    const parsed = parseAndPrepare(proxyUrl);
    const result = await verifyProxy(parsed);

    if (result.success) {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 1, ping: result.ping }));
    } else {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 0, error: result.error }));
    }
  } catch (err) {
    const errorMsg = err.message || String(err);
    res.writeHead(200);
    res.end(JSON.stringify({ status: 0, error: errorMsg }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Telegram proxy checker (MTProto + SOCKS5) listening on http://0.0.0.0:${PORT}`);
  console.log(`Usage: GET ?link=<url-encoded-proxy-link>`);
});
