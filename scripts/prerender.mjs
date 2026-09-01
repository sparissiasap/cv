import { createServer } from 'http';
import { createReadStream, writeFileSync, existsSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist', 'cv-site', 'browser');
const PORT = 4201;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.woff2':'font/woff2',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain',
  '.xml':  'application/xml',
};

function startServer() {
  return new Promise(resolve => {
    const server = createServer((req, res) => {
      let urlPath = req.url.split('?')[0].replace(/\/$/, '') || '/index';
      let filePath = join(distDir, urlPath);
      if (!extname(filePath)) filePath = join(filePath, 'index.html');
      if (!existsSync(filePath)) filePath = join(distDir, 'index.html');
      const mime = MIME[extname(filePath)] || 'application/octet-stream';
      res.setHeader('Content-Type', mime);
      createReadStream(filePath).on('error', () => {
        res.writeHead(404); res.end();
      }).pipe(res);
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

const ROUTES = ['sergio', 'dafne', 'giovanna', 'teresina', 'menu', 'misfinanzas'];

const server = await startServer();
console.log(`Static server ready on port ${PORT}`);

const browser = await chromium.launch();

for (const route of ROUTES) {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/${route}`, { waitUntil: 'networkidle' });
  const html = await page.content();
  writeFileSync(join(distDir, route, 'index.html'), html);
  console.log(`✓ prerendered /${route}`);
  await page.close();
}

await browser.close();
server.close();
console.log('Prerender complete.');
