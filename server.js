const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

function send(response, status, body, type = 'application/json') {
  response.writeHead(status, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store' });
  response.end(type === 'application/json' ? JSON.stringify(body) : body);
}
const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  try {
    if (request.method === 'GET' && url.pathname === '/') {
      const html = fs.readFileSync(path.join(ROOT, 'index.html'));
      return send(response, 200, html, 'text/html');
    }
    if (request.method === 'GET' && /\.(jpeg|jpg|png|gif|webp)$/i.test(url.pathname)) {
      const fileName = path.basename(decodeURIComponent(url.pathname));
      const filePath = path.join(ROOT, fileName);
      if (!fs.existsSync(filePath)) return send(response, 404, { error: 'not-found' });
      const mimeTypes = { '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
      response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] });
      return response.end(fs.readFileSync(filePath));
    }
    send(response, 404, { error: 'not-found' });
  } catch (error) {
    send(response, 500, { error: error.message });
  }
});

server.listen(PORT, () => console.log(`Portal guru berjalan di http://localhost:${PORT}`));
