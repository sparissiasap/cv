const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const A4_W = 794;
const A4_H = 1123;
const PORT = 7744;

function serveFile(req, res) {
  const filePath = path.join(__dirname, url.parse(req.url).pathname);
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

  await page.emulateMedia({ media: 'print' });
  await page.setViewportSize({ width: A4_W, height: A4_H * 6 });

  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const pages = Math.ceil(totalHeight / A4_H);
  console.log(`Total height: ${totalHeight}px → ${pages} A4 pages`);

  // Full-page screenshot
  const fullBuf = await page.screenshot({ fullPage: true });
  fs.writeFileSync('print-full.png', fullBuf);
  console.log('print-full.png saved');

  // Per-page screenshots — crop the full image at each A4 boundary
  const { createCanvas, loadImage } = (() => {
    try { return require('canvas'); } catch { return {}; }
  })();

  if (createCanvas && loadImage) {
    const full = await loadImage(fullBuf);
    for (let i = 0; i < pages; i++) {
      const canvas = createCanvas(A4_W, A4_H);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, A4_W, A4_H);
      ctx.drawImage(full, 0, -(i * A4_H));
      const out = `print-page-${i + 1}.png`;
      fs.writeFileSync(out, canvas.toBuffer('image/png'));
      console.log(`${out} saved`);
    }
  } else {
    // Fallback: viewport-scroll approach (less accurate but works without canvas)
    for (let i = 0; i < pages; i++) {
      await page.evaluate(y => window.scrollTo(0, y), i * A4_H);
      await page.screenshot({ path: `print-page-${i + 1}.png`, clip: { x: 0, y: i * A4_H, width: A4_W, height: A4_H } });
      console.log(`print-page-${i + 1}.png saved`);
    }
  }

  // Report elements crossing page breaks
  const pageBreaks = Array.from({ length: pages - 1 }, (_, i) => (i + 1) * A4_H);
  console.log('\nPage break boundaries (px):', pageBreaks);

  const elements = await page.evaluate((breaks) => {
    const selectors = ['.hero', '.card', '.timeline-item', '.cert-item', '.exp-bar', '.section-label', '.sidebar-col', '.main-col'];
    const results = [];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const r = el.getBoundingClientRect();
        results.push({ selector: sel, top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) });
      });
    });
    return results.sort((a, b) => a.top - b.top);
  }, pageBreaks);

  pageBreaks.forEach(breakY => {
    console.log(`\n--- Page break at y=${breakY} ---`);
    elements
      .filter(el => el.top < breakY + 60 && el.bottom > breakY - 60)
      .forEach(el => {
        const crossing = el.top < breakY && el.bottom > breakY ? ' ⚠️ CROSSES BREAK' : '';
        console.log(`  ${el.selector.padEnd(16)} top=${el.top} bottom=${el.bottom} h=${el.height}${crossing}`);
      });
  });

  await browser.close();
  server.close();
})();
