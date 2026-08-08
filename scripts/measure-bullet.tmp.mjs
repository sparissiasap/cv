import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto('http://localhost:4300/sergio', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const info = await page.evaluate(() => {
  const lis = Array.from(document.querySelectorAll('.job-bullets li'));
  const target = lis.find(li => li.textContent.includes('long-term'));
  const r = target.getBoundingClientRect();
  const cs = getComputedStyle(target);
  return { height: r.height, lineHeight: cs.lineHeight, fontSize: cs.fontSize, text: target.textContent.trim().slice(0, 60) };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
