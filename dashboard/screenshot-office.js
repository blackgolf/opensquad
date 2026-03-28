const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1500);
  const links = await page.locator('text=Sim').all();
  if (links.length > 0) await links[links.length - 1].click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'C:/Users/renat/AppData/Local/Temp/dashboard-office-after.png' });
  await browser.close();
  console.log('Done');
})();
