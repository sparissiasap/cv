const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const SITE_DIR = __dirname;
const PORT = 7743;

function serveFile(req, res) {
  const filePath = path.join(SITE_DIR, url.parse(req.url).pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(filePath).toLowerCase();
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
      '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

(async () => {
  const server = http.createServer(serveFile);
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 794, height: 1123 });

  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Downscale profile photo via canvas (200×200 JPEG at 88% quality).
  // Playwright embeds the full-resolution source PNG; this keeps PDF size small.
  await page.evaluate(() => {
    return new Promise(resolve => {
      const img = document.querySelector('.hero-photo');
      if (!img) return resolve();
      const draw = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 200; canvas.height = 200;
        canvas.getContext('2d').drawImage(img, 0, 0, 200, 200);
        img.src = canvas.toDataURL('image/jpeg', 0.88);
        img.onload = resolve; img.onerror = resolve;
        if (img.complete) resolve();
      };
      if (img.complete && img.naturalWidth) draw();
      else { img.onload = draw; img.onerror = resolve; }
    });
  });

  await page.pdf({
    path: 'cv.pdf',
    format: 'A4',
    printBackground: true,
    scale: 0.82,
    margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
    displayHeaderFooter: false,
  });

  await browser.close();
  server.close();

  const size = (fs.statSync('cv.pdf').size / 1024 / 1024).toFixed(1);
  console.log(`cv.pdf generated — ${size} MB`);
})();
