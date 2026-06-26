const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 627 });

  const filePath = path.resolve(__dirname, 'index.html');
  await page.goto(`file:///${filePath.replace(/\\/g, '/')}`);

  // Wait for fonts, bg orbs and body.loaded class
  await page.waitForTimeout(1800);

  await page.screenshot({ path: 'og-image.png', clip: { x: 0, y: 0, width: 1200, height: 627 } });

  await browser.close();
  console.log('og-image.png generated (1200x627)');
})();
