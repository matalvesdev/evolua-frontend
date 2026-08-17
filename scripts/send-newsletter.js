#!/usr/bin/env node
/**
 * Newsletter sender — triggered by cron every Wednesday 13:00 UTC.
 *
 * Reads subscribers from `newsletter_subscribers` table and sends
 * the latest blog post via Resend (transactional email).
 *
 * Idempotency: subscribers are de-duplicated by email within the
 * same execution to prevent accidental re-sends, and the process
 * exits non-zero if any send fails.
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

const supabaseHeaders = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

async function fetchWithRetry(url, options = {}, retries = 3, baseDelayMs = 1000) {
  let lastErr
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options, 30000)
      // Retry on transient server errors / rate limiting
      if (res.status >= 500 || res.status === 429) {
        lastErr = new Error(`HTTP ${res.status}`)
        if (attempt < retries - 1) {
          const delay = baseDelayMs * Math.pow(2, attempt)
          console.log(`  Retry ${attempt + 1}/${retries} after ${delay}ms (HTTP ${res.status})`)
          await new Promise(r => setTimeout(r, delay))
        }
        continue
      }
      return res
    } catch (err) {
      lastErr = err
      if (attempt < retries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt)
        console.log(`  Retry ${attempt + 1}/${retries} after ${delay}ms: ${err.message}`)
        await new Promise(r => setTimeout(r, delay))
      }
    }
  }
  throw lastErr
}

async function main() {
  // 1. Fetch latest published blog post
  const postsRes = await fetchWithRetry(
    `${SUPABASE_URL}/rest/v1/blog_posts?select=*&status=eq.published&order=published_at.desc&limit=1`,
    { headers: supabaseHeaders }
  )
  if (!postsRes.ok) {
    if (postsRes.status === 404) {
      console.log('Table blog_posts does not exist yet — create via Prisma migration and run again')
    } else {
      console.error(`Failed to fetch posts: ${postsRes.status} ${postsRes.statusText}`)
    }
    process.exit(1)
  }
  const posts = await postsRes.json()
  if (posts.length === 0) {
    console.log('No published posts found — skipping')
    return
  }
  const post = posts[0]

  // 2. Fetch active subscribers (with pagination, de-duplicated by email)
  const subscribersByEmail = new Map()
  let offset = 0
  const limit = 1000
  while (true) {
    const subsRes = await fetchWithRetry(
      `${SUPABASE_URL}/rest/v1/newsletter_subscribers?select=email,name,unsubscribe_token&subscribed_at=not.is.null&unsubscribed_at=is.null&limit=${limit}&offset=${offset}`,
      { headers: supabaseHeaders }
    )
    if (!subsRes.ok) throw new Error(`Failed to fetch subscribers: ${subsRes.status}`)
    const batch = await subsRes.json()
    if (batch.length === 0) break
    for (const sub of batch) {
      if (sub && sub.email && !subscribersByEmail.has(sub.email)) {
        subscribersByEmail.set(sub.email, sub)
      }
    }
    if (batch.length < limit) break
    offset += limit
  }
  const subscribers = [...subscribersByEmail.values()]
  if (subscribers.length === 0) {
    console.log('No subscribers — skipping')
    return
  }
  const subscribersWithoutToken = subscribers.filter(sub => !sub.unsubscribe_token).length
  if (subscribersWithoutToken > 0) {
    throw new Error(`${subscribersWithoutToken} subscriber(s) are missing an unsubscribe token`)
  }

  console.log(`Sending newsletter to ${subscribers.length} subscribers`)
  console.log(`Post: "${post.title}" (${post.slug})`)

  if (DRY_RUN) {
    console.log('DRY RUN — skipping actual send')
    return
  }

  // 4. Send individually via Resend API with timeout/retry
  let sent = 0
  let failed = 0
  const sentEmails = new Set()
  for (const sub of subscribers) {
    if (sentEmails.has(sub.email)) continue // defensive: never re-send in same run
    const unsubscribeUrl = `https://useevolua.com.br/newsletter/cancelar?token=${encodeURIComponent(sub.unsubscribe_token)}`
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

    try {
      const sendRes = await fetchWithRetry('https://api.resend.com/emails', {
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
      }, 2, 2000)

      if (sendRes.ok) {
        sent++
        sentEmails.add(sub.email)
      } else {
        failed++
        const errText = await sendRes.text()
        console.error(`  Failed for ${sub.email}: ${sendRes.status} ${errText.slice(0, 200)}`)
      }
    } catch (err) {
      failed++
      console.error(`  Failed for ${sub.email}: ${err.message}`)
    }
  }

  console.log(`Newsletter sent: ${sent} ok, ${failed} failed`)

  // Exit non-zero so cron/observability can detect partial or total failure
  if (failed > 0) {
    console.error(`Newsletter finished with ${failed} failed send(s)`)
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Newsletter cron failed:', err)
  process.exit(1)
})
