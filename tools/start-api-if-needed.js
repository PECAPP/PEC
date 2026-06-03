const net = require('net');
const { spawn } = require('child_process');

const PORT = Number(process.env.API_PORT || 8000);
const HOST = '127.0.0.1';

function isPortOpen(port, host, timeoutMs = 500) {
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

async function main() {
  const alreadyRunning = await isPortOpen(PORT, HOST);

  if (alreadyRunning) {
    console.log(`API already listening on port ${PORT}; skipping duplicate start.`);
    return;
  }

  const npmCommand = process.platform === 'win32'
    ? 'npm.cmd --prefix server run start:dev'
    : 'npm --prefix server run start:dev';

  const child = spawn(npmCommand, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
