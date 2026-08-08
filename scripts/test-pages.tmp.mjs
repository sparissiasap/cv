import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

const OUT = 'C:\\Users\\spr_1\\AppData\\Local\\Temp\\claude\\C--Users-spr-1-source-repos-cv\\702f45de-a151-4ebe-873d-39aaf55fe153\\scratchpad';
const WIDTH = Number(process.argv[2] || 1400);
const DPR = Number(process.argv[3] || 1);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: 1000 }, deviceScaleFactor: DPR });
page.on('console', msg => { if (!/^#\d+ /.test(msg.text())) console.log('LOG:', msg.text()); });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
const start0 = Date.now();
await page.goto('http://localhost:4300/sergio', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

await page.evaluate(() => {
  const orig = HTMLCanvasElement.prototype.toDataURL;
  window.__captures = [];
  HTMLCanvasElement.prototype.toDataURL = function (...args) {
    const result = orig.apply(this, args);
    if (this.width > 500) window.__captures.push({ w: this.width, h: this.height, data: result });
    return result;
  };
});

const clickStart = Date.now();
const buttons = await page.locator('.share-bar button').all();
for (const b of buttons) {
  const label = (await b.getAttribute('aria-label')) || (await b.getAttribute('title')) || '';
  if (/pdf/i.test(label)) { await b.click(); break; }
}

// Check the loading state appears right after click
await page.waitForTimeout(50);
const loadingVisible = await page.locator('.share-icon-spinner').count();
console.log('Spinner visible right after click:', loadingVisible > 0);

await page.waitForTimeout(4000);
const elapsed = Date.now() - clickStart;
console.log('Total time from click to done (ms):', elapsed);

const captures = await page.evaluate(() => window.__captures.map(c => ({ w: c.w, h: c.h, data: c.data })));
console.log('Total captures:', captures.length);
captures.forEach((c, i) => {
  writeFileSync(join(OUT, `page-${i}.png`), Buffer.from(c.data.split(',')[1], 'base64'));
  console.log(`page-${i}.png: ${c.w}x${c.h}`);
});

await browser.close();
