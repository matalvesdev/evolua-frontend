#!/usr/bin/env node
/**
 * Newsletter sender — triggered by cron every Wednesday 10:00 BRT.
 *
 * Reads subscribers from `newsletter_subscribers` table and sends
 * the latest blog post via Resend (transactional email).
 *
 * Usage:
 *   node scripts/send-newsletter.js [--dry-run]
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || 'noreply@useevolua.com.br'
const DRY_RUN = process.argv.includes('--dry-run')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !RESEND_API_KEY) {
  console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY')
  process.exit(1)
}

async function main() {
  // Fetch latest published blog post
  const postsRes = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=*&status=eq.published&order=published_at.desc&limit=1`, {
    headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
  })
  if (!postsRes.ok) {
    if (postsRes.status === 404) {
      console.log('Table blog_posts does not exist yet — create via Prisma migration and run again')
    } else {
      console.log(`Failed to fetch posts: ${postsRes.status} ${postsRes.statusText}`)
    }
    return
  }
  const posts = await postsRes.json()
  if (posts.length === 0) {
    console.log('No published posts found — skipping')
    return
  }
  const post = posts[0]

  // Fetch active subscribers (with pagination in case of thousands)
  const subscribers = []
  let offset = 0
  const limit = 1000
  while (true) {
    const subsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/newsletter_subscribers?select=email,name&subscribed_at=not.is.null&unsubscribed_at=is.null&limit=${limit}&offset=${offset}`,
      { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
    )
    if (!subsRes.ok) throw new Error(`Failed to fetch subscribers: ${subsRes.status}`)
    const batch = await subsRes.json()
    if (batch.length === 0) break
    subscribers.push(...batch)
    if (batch.length < limit) break
    offset += limit
  }
  if (subscribers.length === 0) {
    console.log('No subscribers — skipping')
    return
  }

  console.log(`Sending newsletter to ${subscribers.length} subscribers`)
  console.log(`Post: "${post.title}" (${post.slug})`)

  if (DRY_RUN) {
    console.log('DRY RUN — skipping actual send')
    return
  }

  // Send individually via Resend API for per-recipient unsubscribe link
  let sent = 0
  let failed = 0
  for (const sub of subscribers) {
    const unsubscribeUrl = `https://useevolua.com.br/newsletter/cancelar?email=${encodeURIComponent(sub.email)}`
    const htmlBody = `
      <div style="max-width:600px;margin:0 auto;font-family:sans-serif">
        <h1 style="color:#6C63FF">Fono em Foco</h1>
        <h2>${post.title}</h2>
        <p>${post.excerpt || ''}</p>
        <a href="https://useevolua.com.br/blog/${post.slug}" style="display:inline-block;background:#6C63FF;color:white;padding:12px 24px;text-decoration:none;border-radius:4px">
          Ler na íntegra
        </a>
        <hr style="margin:24px 0" />
        <p style="color:#8888AA;font-size:12px">
          Se não quiser receber mais emails, <a href="${unsubscribeUrl}">cancele a inscrição</a>.
        </p>
      </div>
    `
    const textBody = `${post.title}\n\n${post.excerpt || ''}\n\nLeia em: https://useevolua.com.br/blog/${post.slug}\n\nPara cancelar: ${unsubscribeUrl}`

    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [sub.email],
        subject: `Fono em Foco: ${post.title}`,
        html: htmlBody,
        text: textBody,
      }),
    })

    if (sendRes.ok) {
      sent++
    } else {
      failed++
      const errText = await sendRes.text()
      console.error(`  Failed for ${sub.email}: ${sendRes.status} ${errText.slice(0, 200)}`)
    }
  }

  console.log(`Newsletter sent: ${sent} ok, ${failed} failed`)
}

main().catch(err => {
  console.error('Newsletter cron failed:', err)
  process.exit(1)
})
