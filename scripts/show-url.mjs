import os from 'os';

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
  console.log(`Network link: http://${lanIp}:${port}`);
}



