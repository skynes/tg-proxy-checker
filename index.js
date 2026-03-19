#!/usr/bin/env node

const tdl = require('tdl');
const { getTdjson } = require('prebuilt-tdlib');
const { parseAndPrepare, verifyProxy } = require('./lib/verify');

try {
  tdl.configure({ tdjson: getTdjson() });
} catch (error) {
  // fallback to system library
}

const args = process.argv.slice(2);
const debugMode = args.includes('--debug');
const proxyArg = args.find(arg => arg !== '--debug');

async function main() {
  let proxyUrl;

  if (proxyArg) {
    proxyUrl = proxyArg;
  } else {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
    let lineReceived = false;
    proxyUrl = await new Promise((resolve) => {
      rl.on('line', (line) => {
        lineReceived = true;
        resolve(line.trim());
        rl.close();
      });
      rl.on('close', () => {
        if (!lineReceived) resolve(null);
      });
    });
  }

  if (!proxyUrl) {
    console.error('Usage: node index.js [--debug] <proxy_url>');
    console.error('   or: echo "<proxy_url>" | node index.js [--debug]');
    process.exit(1);
  }

  try {
    const parsed = parseAndPrepare(proxyUrl);
    if (debugMode) {
      console.error(`[DEBUG] Type: ${parsed.type}, Server: ${parsed.server}, Port: ${parsed.port}`);
    }
    const result = await verifyProxy(parsed);
    if (result.success) {
      console.log(`OK ${result.ping}`);
      process.exit(0);
    } else {
      console.log(`NO: ${result.error}`);
      process.exit(2);
    }
  } catch (error) {
    if (error.message === 'INVALID_SECRET' || error.message.includes('INVALID_SECRET')) {
      console.log('INVALID_SECRET');
      process.exit(1);
    }
    if (debugMode) {
      console.error(`[DEBUG] Error:`, error.message || error);
    }
    console.log('NO');
    process.exit(2);
  }
}

main().catch((error) => {
  if (debugMode) {
    console.error(`[DEBUG] Unhandled error:`, error);
  }
  console.log('NO');
  process.exit(2);
});
