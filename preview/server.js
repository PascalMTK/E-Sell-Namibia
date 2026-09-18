const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const port = Number(process.env.PORT || 4173);

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const asset = pathname === '/' ? '/index.html' : pathname;
  if (!['/index.html', '/styles.css', '/script.js'].includes(asset)) {
    response.writeHead(404).end('Not found');
    return;
  }
  const file = path.join(root, asset);
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404).end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(data);
  });
}).listen(port, '127.0.0.1', () => console.log(`E-Sell preview: http://127.0.0.1:${port}`));
