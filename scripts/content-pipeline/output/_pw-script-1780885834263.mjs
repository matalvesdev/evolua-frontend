
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1080 } });
  const p = await ctx.newPage();
  await p.goto('file:///C:/Users/Mateus Alves Bassane/Desktop/Evolua V2/docs/content-assets/03-instagram-feed/carrossel-5-passos.html', { waitUntil: 'networkidle', timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(3000);

  const items = await p.$$('.slide');
  if (items.length === 0) {
    console.log('NO_ITEMS for .slide');
    await p.screenshot({ path: 'C:/Users/Mateus Alves Bassane/Desktop/Evolua V2/scripts/content-pipeline/output/slides-carrossel/carrossel-5-passos.png', type: 'png' });
  } else {
    for (let i = 0; i < items.length; i++) {
      await items[i].screenshot({
        path: 'C:/Users/Mateus Alves Bassane/Desktop/Evolua V2/scripts/content-pipeline/output/slides-carrossel/carrossel-5-passos-' + (i + 1) + '.png',
        type: 'png',
      });
      console.log('OK ' + (i + 1));
    }
  }
  console.log('DONE:' + items.length);
  await b.close();
})().catch(e => { console.error('PW_ERR:', e.message); process.exit(1); });
