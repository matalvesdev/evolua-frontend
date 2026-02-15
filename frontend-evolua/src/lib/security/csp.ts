/**
 * CSP (Content Security Policy) module.
 * Generates nonces and builds CSP header strings for the middleware.
 */

export interface CSPConfig {
  nonce: string
  isDev: boolean
}

/**
 * Generates a cryptographically random base64 nonce (16 bytes).
 * Uses Web Crypto API for edge runtime compatibility.
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  // Convert to base64 using btoa (available in edge runtime)
  const binary = String.fromCharCode(...bytes)
  return btoa(binary)
}

/**
 * Builds a complete CSP header string from the given config.
 * Includes all directives required by the Evolua CRM frontend.
 */
export function buildCSP({ nonce, isDev }: CSPConfig): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ""
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""

  const scriptSrc = isDev
    ? `'self' 'unsafe-eval' 'unsafe-inline'`
    : `'self' 'unsafe-inline'`

  const connectSources = ["'self'", "*.supabase.co"]
  if (supabaseUrl) connectSources.push(supabaseUrl)
  if (apiUrl) connectSources.push(apiUrl)

  const directives: Record<string, string> = {
    "default-src": "'self'",
    "script-src": scriptSrc,
    "style-src": "'self' 'unsafe-inline' fonts.googleapis.com",
    "style-src-elem": "'self' 'unsafe-inline' fonts.googleapis.com",
    "img-src": "'self' data: blob: *.supabase.co lh3.googleusercontent.com",
    "connect-src": connectSources.join(" "),
    "frame-ancestors": "'none'",
    "font-src": "'self' fonts.googleapis.com fonts.gstatic.com",
    "object-src": "'none'",
    "base-uri": "'self'",
    "form-action": "'self'",
  }

  return Object.entries(directives)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ")
}
