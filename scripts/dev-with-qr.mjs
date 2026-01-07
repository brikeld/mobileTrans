import { spawn } from 'child_process';
import os from 'os';
import qrcode from 'qrcode-terminal';

// Get LAN IP
const interfaces = os.networkInterfaces();
let lanIp = null;
for (const name of Object.keys(interfaces)) {
  for (const info of interfaces[name] || []) {
    if (info.family === 'IPv4' && !info.internal) {
      lanIp = info.address;
      break;
    }
  }
  if (lanIp) break;
}

const port = process.env.PORT || 5173;
const url = lanIp ? `http://${lanIp}:${port}` : `http://localhost:${port}`;

// Start Vite
const vite = spawn('vite', ['--host', '0.0.0.0', '--port', port.toString()], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for Vite to start, then show QR code
setTimeout(() => {
  if (lanIp) {
    console.log(`\n\n📱 Scan this QR code with your phone to access:\n`);
    console.log(`Network link: ${url}\n`);
    qrcode.generate(url, { small: true });
    console.log('\n');
  } else {
    console.log(`\n\n⚠️  Could not determine local network IP.`);
    console.log(`Local URL: ${url}\n`);
  }
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  vite.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  vite.kill();
  process.exit();
});

