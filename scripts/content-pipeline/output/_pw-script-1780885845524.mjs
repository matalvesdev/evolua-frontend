
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1200, height: 627 } });
  const p = await ctx.newPage();
  await p.goto('file:///C:/Users/Mateus Alves Bassane/Desktop/Evolua V2/scripts/content-pipeline/output/linkedin-html/linkedin-posts.html', { waitUntil: 'networkidle', timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(3000);

  const items = await p.$$('.post');
  if (items.length === 0) {
    console.log('NO_ITEMS for .post');
    await p.screenshot({ path: 'C:/Users/Mateus Alves Bassane/Desktop/Evolua V2/scripts/content-pipeline/output/slides-linkedin/linkedin-posts.png', type: 'png' });
  } else {
    for (let i = 0; i < items.length; i++) {
      await items[i].screenshot({
        path: 'C:/Users/Mateus Alves Bassane/Desktop/Evolua V2/scripts/content-pipeline/output/slides-linkedin/linkedin-posts-' + (i + 1) + '.png',
        type: 'png',
      });
      console.log('OK ' + (i + 1));
    }
  }
  console.log('DONE:' + items.length);
  await b.close();
})().catch(e => { console.error('PW_ERR:', e.message); process.exit(1); });
