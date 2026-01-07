import os from 'os';
import qrcode from 'qrcode-terminal';

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

if (!lanIp) {
  console.log('Could not determine local network IP.');
} else {
  const port = process.env.PORT || 5173;
  const url = `http://${lanIp}:${port}`;
  console.log(`\nNetwork link: ${url}\n`);
  console.log('Scan this QR code with your phone:');
  qrcode.generate(url, { small: true });
  console.log('');
}










