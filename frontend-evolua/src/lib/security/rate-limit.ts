/**
 * Rate Limiting module.
 * Wraps @upstash/ratelimit with graceful fallback when Redis is unavailable.
 * Runs in Next.js middleware (edge runtime).
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

interface RateLimitConfig {
  route: string
  requests: number
  window: `${number} s` | `${number} m`
}

const RATE_LIMIT_CONFIGS: RateLimitConfig[] = [
  { route: "/auth/login", requests: 5, window: "60 s" },
  { route: "/auth/cadastro", requests: 3, window: "60 s" },
]

const FALLBACK_RESULT: RateLimitResult = {
  success: true,
  limit: 0,
  remaining: 0,
  reset: 0,
}

/**
 * Creates a map of route → Ratelimit instance.
 * Returns null if Upstash env vars are missing.
 */
function createRateLimiters(): Map<string, Ratelimit> | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  const redis = new Redis({ url, token })
  const limiters = new Map<string, Ratelimit>()

  for (const config of RATE_LIMIT_CONFIGS) {
    limiters.set(
      config.route,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.requests, config.window),
        prefix: `ratelimit:${config.route}`,
      })
    )
  }

  return limiters
}

let rateLimiters: Map<string, Ratelimit> | null | undefined

function getRateLimiters(): Map<string, Ratelimit> | null {
  if (rateLimiters === undefined) {
    rateLimiters = createRateLimiters()
    if (rateLimiters === null) {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not configured. Rate limiting is disabled."
      )
    }
  }
  return rateLimiters
}

/**
 * Checks rate limit for a given identifier (IP) and route.
 * Returns a graceful fallback if Redis is not configured or the route has no limit.
 */
export async function checkRateLimit(
  identifier: string,
  route: string
): Promise<RateLimitResult> {
  const limiters = getRateLimiters()

  if (!limiters) {
    return FALLBACK_RESULT
  }

  const limiter = limiters.get(route)
  if (!limiter) {
    return FALLBACK_RESULT
  }

  try {
    const result = await limiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    console.error("[rate-limit] Failed to check rate limit:", error)
    return FALLBACK_RESULT
  }
}
