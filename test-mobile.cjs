const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  // Galaxy Z Flip 6 has approximately 360x740 when folded (cover screen is 720x748 but inner is what matters)
  // Using a custom viewport similar to Z Flip inner screen
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 },
    deviceScaleFactor: 2.5,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  console.log('Opening http://localhost:7780...');
  await page.goto('http://localhost:7780');
  await page.waitForTimeout(3000);

  console.log('Taking screenshots...');

  // Overview page
  await page.screenshot({
    path: 'P:/software/allmind/mobile-overview.png',
    fullPage: true
  });

  console.log('Screenshot saved to P:/software/allmind/mobile-overview.png');

  // Try clicking a repo to see detail page
  try {
    const repos = await page.$$('[class*="cursor-pointer"]');
    if (repos.length > 0) {
      console.log('Clicking first repo...');
      await repos[0].click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'P:/software/allmind/mobile-repo-detail.png',
        fullPage: true
      });
      console.log('Screenshot saved to P:/software/allmind/mobile-repo-detail.png');
    }
  } catch (e) {
    console.log('Could not navigate to repo detail:', e.message);
  }

  await browser.close();
  console.log('Done!');
})();
