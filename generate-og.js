const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const ogDir = path.join(__dirname, 'og');
  if (!fs.existsSync(ogDir)) fs.mkdirSync(ogDir);

  const templatePath = path.join(__dirname, 'og-template.html');
  const templateUrl = 'file://' + templatePath;

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1
  });

  for (let i = 1; i <= 12; i++) {
    const page = await context.newPage();
    await page.goto(`${templateUrl}?session=${i}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ogDir, `session-${i}.png`),
      type: 'png'
    });
    await page.close();
    console.log(`Generated og/session-${i}.png`);
  }

  const homePage = await context.newPage();
  await homePage.goto(`${templateUrl}?home=1`, { waitUntil: 'networkidle' });
  await homePage.waitForTimeout(500);
  await homePage.screenshot({
    path: path.join(ogDir, `home.png`),
    type: 'png'
  });
  await homePage.close();
  console.log('Generated og/home.png');

  await browser.close();
  console.log('Done — all OG images generated.');
})();
