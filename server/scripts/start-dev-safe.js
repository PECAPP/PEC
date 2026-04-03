const net = require('net');
const { spawn } = require('child_process');

const PORT = Number(process.env.PORT || 8000);
const HOST = '127.0.0.1';
const API_PROBE_PATH = '/api';

function canConnect(port, host, timeoutMs = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));

    socket.connect(port, host);
  });
}

async function looksLikeOurApi(port) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`http://${HOST}:${port}${API_PROBE_PATH}`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok || res.status === 401 || res.status === 403;
  } catch {
    return false;
  }
}

async function main() {
  const occupied = await canConnect(PORT, HOST);

  if (occupied) {
    const sameApi = await looksLikeOurApi(PORT);
    if (sameApi) {
      console.log(`API already running on port ${PORT}. Reusing existing process.`);
      process.exit(0);
    }

    console.error(
      `Port ${PORT} is occupied by another process that is not this API. ` +
        `Free the port or set PORT to a different value in server/.env.`,
    );
    process.exit(1);
  }

  const tsNodeCmd = process.platform === 'win32'
    ? 'ts-node --project tsconfig.json -r tsconfig-paths/register --transpile-only src/main.ts'
    : 'ts-node --project tsconfig.json -r tsconfig-paths/register --transpile-only src/main.ts';

  const child = spawn(tsNodeCmd, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
