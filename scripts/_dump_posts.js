const { readFileSync } = require('fs');
const { Client } = require('pg');
const env = readFileSync('.env', 'utf8');
const db = env.match(/DATABASE_URL="(.+?)"/)[1];

(async () => {
  const c = new Client({ connectionString: db, ssl: { rejectUnauthorized: false } });
  await c.connect();

  // Full dump of every column for the first post
  const { rows: sample } = await c.query("SELECT * FROM blog_posts LIMIT 1");
  console.log("=== PRIMEIRO POST (todas as colunas) ===");
  for (const [k, v] of Object.entries(sample[0])) {
    const val = typeof v === 'string' ? v.substring(0, 100) : String(v);
    console.log(`  ${k}: ${val}`);
  }

  // All posts with key mapping columns
  const { rows: posts } = await c.query("SELECT id, title, slug, excerpt, content IS NOT NULL as has_content, length(content) as content_len, status, featured, category FROM blog_posts ORDER BY created_at DESC");
  console.log("\n=== TODOS OS POSTS ===");
  posts.forEach(p => {
    console.log(`  [${p.id.substring(0,8)}] featured=${p.featured} status=${p.status} category=${p.category} content_len=${p.content_len} slug=${p.slug} title=${p.title ? p.title.substring(0,40) : '(sem titulo)'}`);
  });

  // Check image URL
  const { rows: images } = await c.query("SELECT slug, cover_image FROM blog_posts WHERE cover_image IS NOT NULL LIMIT 5");
  console.log("\n=== IMAGENS ===");
  images.forEach(i => console.log(`  ${i.slug}: ${i.cover_image}`));

  await c.end();
})().catch(e => { console.error("ERRO:", e); process.exit(1); });
