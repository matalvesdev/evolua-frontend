
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1200, height: 628 } });
  const p = await ctx.newPage();
  await p.goto('file:///home/runner/work/evolua-frontend/evolua-frontend/scripts/content-pipeline/output/google-ads-html/google-ads-display.html', { waitUntil: 'networkidle', timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(3000);

  const items = await p.$$('.ad');
  if (items.length === 0) {
    console.log('NO_ITEMS for .ad');
    await p.screenshot({ path: '/home/runner/work/evolua-frontend/evolua-frontend/scripts/content-pipeline/output/slides-google-display/google-ads-display.png', type: 'png' });
  } else {
    for (let i = 0; i < items.length; i++) {
      await items[i].screenshot({
        path: '/home/runner/work/evolua-frontend/evolua-frontend/scripts/content-pipeline/output/slides-google-display/google-ads-display-' + (i + 1) + '.png',
        type: 'png',
      });
      console.log('OK ' + (i + 1));
    }
  }
  console.log('DONE:' + items.length);
  await b.close();
})().catch(e => { console.error('PW_ERR:', e.message); process.exit(1); });
