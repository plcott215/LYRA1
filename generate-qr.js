import qrcode from 'qrcode-terminal';
import ip from 'ip';

const localIp = ip.address();
const url = `http://${localIp}:3000`;

console.log('\n📱 Scan this QR code to open the app on your phone:');
console.log(`Or visit: ${url}\n`);
qrcode.generate(url); 