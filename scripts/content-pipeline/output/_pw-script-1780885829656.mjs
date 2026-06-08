
import { chromium } from 'playwright';
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  await p.goto('file:///C:/Users/Mateus Alves Bassane/Desktop/Evolua V2/docs/content-assets/05-lead-magnets/infraco-atendimento-humanizado.html', { waitUntil: 'networkidle', timeout: 30000 });
  await p.waitForTimeout(2000);
  await p.pdf({
    path: 'C:/Users/Mateus Alves Bassane/Desktop/Evolua V2/scripts/content-pipeline/output/pdfs/infraco-atendimento-humanizado.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
  });
  console.log('PDF_OK');
  await b.close();
})().catch(e => { console.error('PDF_ERR:', e.message); process.exit(1); });
