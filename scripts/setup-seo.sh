#!/usr/bin/env bash
# ============================================================
# Evolua — SEO Setup Script
# ============================================================
# Gera sitemap.xml e robots.txt para landing + frontend
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== SEO Setup ==="

# ── Sitemap para landing-core ────────────────────────────────
SITEMAP_LANDING="$PROJECT_ROOT/landing-core/public/sitemap.xml"
cat > "$SITEMAP_LANDING" << 'SITEMAP'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://useevolua.com.br/</loc><priority>1.0</priority></url>
  <url><loc>https://useevolua.com.br/blog</loc><priority>0.9</priority></url>
  <url><loc>https://useevolua.com.br/planos</loc><priority>0.8</priority></url>
  <url><loc>https://useevolua.com.br/sobre</loc><priority>0.7</priority></url>
  <url><loc>https://useevolua.com.br/ajuda</loc><priority>0.6</priority></url>
  <url><loc>https://useevolua.com.br/changelog</loc><priority>0.5</priority></url>
  <url><loc>https://useevolua.com.br/contato</loc><priority>0.5</priority></url>
  <url><loc>https://useevolua.com.br/termos</loc><priority>0.3</priority></url>
  <url><loc>https://useevolua.com.br/privacidade</loc><priority>0.3</priority></url>
  <url><loc>https://useevolua.com.br/seguranca</loc><priority>0.3</priority></url>
  <url><loc>https://useevolua.com.br/cookies</loc><priority>0.3</priority></url>
</urlset>
SITEMAP

# ── robots.txt para landing-core ──────────────────────────────
ROBOTS_LANDING="$PROJECT_ROOT/landing-core/public/robots.txt"
cat > "$ROBOTS_LANDING" << 'ROBOTS'
User-agent: *
Allow: /
Sitemap: https://useevolua.com.br/sitemap.xml
ROBOTS

# ── Sitemap para frontend-core ───────────────────────────────
SITEMAP_FRONTEND="$PROJECT_ROOT/frontend-core/public/sitemap.xml"
cat > "$SITEMAP_FRONTEND" << 'SITEMAP'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://app.useevolua.com.br/</loc><priority>0.5</priority></url>
</urlset>
SITEMAP

# ── robots.txt para frontend-core ─────────────────────────────
ROBOTS_FRONTEND="$PROJECT_ROOT/frontend-core/public/robots.txt"
cat > "$ROBOTS_FRONTEND" << 'ROBOTS'
User-agent: *
Disallow: /dashboard
Disallow: /app
Sitemap: https://app.useevolua.com.br/sitemap.xml
ROBOTS

echo "✅ sitemap.xml + robots.txt gerados:"
echo "   landing-core/public/"
echo "   frontend-core/public/"
echo ""
echo "IMPORTANTE: Refaça o deploy da landing e frontend no Vercel para publicar."
