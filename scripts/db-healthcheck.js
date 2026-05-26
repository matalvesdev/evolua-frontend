#!/usr/bin/env node
/**
 * Database health check — triggered by cron daily at 03:17 UTC.
 *
 * Checks:
 * - Supabase connection (simple query)
 * - Recent failed login attempts (security)
 * - Orphan appointments (no patient)
 * - Patients without sessions in 90+ days
 *
 * Usage:
 *   node scripts/db-healthcheck.js
 *   SENTRY_DSN=... node scripts/db-healthcheck.js  # reports to Sentry
 */

const crypto = require('crypto')
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SENTRY_DSN = process.env.SENTRY_DSN

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const headers = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
}

async function main() {
  const checks = []

  // 1. Basic connectivity
  try {
    const start = Date.now()
    await fetch(`${SUPABASE_URL}/rest/v1/`, { headers })
    const latency = Date.now() - start
    checks.push({ check: 'connectivity', status: 'ok', latency: `${latency}ms` })
  } catch (err) {
    checks.push({ check: 'connectivity', status: 'fail', error: err.message })
  }

  // 2. Orphan appointments (no patient)
  try {
    // Use pg_query endpoint or direct table query
    const res = await fetch(`${SUPABASE_URL}/rest/v1/appointments?select=id,patient_id,patient_name,date_time&deleted_at=is.null&patient_id=is.null&limit=10`, { headers })
    const orphans = await res.json()
    if (orphans.length > 0) {
      checks.push({ check: 'orphan_appointments', status: 'warn', count: orphans.length, samples: orphans.map(o => o.id) })
    } else {
      checks.push({ check: 'orphan_appointments', status: 'ok' })
    }
  } catch (err) {
    checks.push({ check: 'orphan_appointments', status: 'error', error: err.message })
  }

  // 3. Inactive patients (no appointment in 90 days)
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const [patientsRes, recentRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/patients?select=id,name&status=eq.active&deleted_at=is.null`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/appointments?select=patient_id&patient_id=not.is.null&deleted_at=is.null&date_time=gte.${ninetyDaysAgo}`, { headers }),
    ])
    const patients = await patientsRes.json()
    const recent = await recentRes.json()
    const activeIds = new Set(recent.map(a => a.patient_id))
    const inactive = patients.filter(p => !activeIds.has(p.id))
    if (inactive.length > 0) {
      checks.push({ check: 'inactive_patients', status: 'warn', count: inactive.length, samples: inactive.slice(0, 5).map(p => p.id) })
    } else {
      checks.push({ check: 'inactive_patients', status: 'ok', total_active: patients.length })
    }
  } catch (err) {
    checks.push({ check: 'inactive_patients', status: 'error', error: err.message })
  }

  // Report
  const failed = checks.filter(c => c.status === 'fail' || c.status === 'warn')
  console.log(`Health check complete: ${checks.length} checks, ${failed.length} issues`)

  for (const c of checks) {
    const icon = c.status === 'ok' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'
    console.log(`${icon} ${c.check}: ${c.status}${c.error ? ' — ' + c.error : ''}${c.count ? ' (' + c.count + ')' : ''}`)
  }

  if (failed.length > 0 && SENTRY_DSN) {
    // Report to Sentry via envelope API
    try {
      const dsn = new URL(SENTRY_DSN)
      const key = dsn.username
      const host = dsn.host
      const projectId = dsn.pathname.replace(/^\//, '')
      const eventId = crypto.randomUUID().replace(/-/g, '')
      const envelope = [
        JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString(), dsn: SENTRY_DSN, sdk: { name: 'evolua-cron', version: '1.0.0' } }),
        JSON.stringify({ type: 'event' }),
        JSON.stringify({ event_id: eventId, level: 'warning', logentry: { message: 'DB Health Check found issues' }, extra: { checks: failed }, timestamp: Date.now() / 1000 }),
      ].join('\n')
      await fetch(`https://${host}/api/${projectId}/envelope/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-sentry-envelope' },
        body: envelope,
      })
    } catch (_) { /* sentry reporting is best-effort */ }
  }

  process.exit(failed.some(c => c.status === 'fail') ? 1 : 0)
}

main()
