import { test, expect } from '@playwright/test'

test.describe('SEO — Meta Tags', () => {
  test('homepage has correct SEO meta tags', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/EVOLUA/)
    const desc = await page.locator('meta[name="description"]').getAttribute('content')
    expect(desc).toContain('fonoaudiólogas')
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe('https://useevolua.com.br/')
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toContain('EVOLUA')
  })

  test('blog page has canonical', async ({ page }) => {
    await page.goto('/blog')
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toContain('/blog')
  })

  test('planos page has title and description', async ({ page }) => {
    await page.goto('/planos')
    await expect(page).toHaveTitle(/Planos/)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content')
  })

  test('auth pages have noindex', async ({ page }) => {
    await page.goto('/entrar')
    const robots = await page.locator('meta[name="robots"]').getAttribute('content')
    expect(robots).toBe('noindex, nofollow')
  })

  test('static pages have proper titles', async ({ page }) => {
    const pages = [
      { path: '/sobre', pattern: /Sobre/ },
      { path: '/nosso-jeito', pattern: /Nosso Jeito/ },
      { path: '/ajuda', pattern: /Ajuda/ },
      { path: '/changelog', pattern: /Changelog/ },
      { path: '/contato', pattern: /Contato/ },
      { path: '/termos', pattern: /Termos/ },
      { path: '/privacidade', pattern: /Privacidade/ },
      { path: '/seguranca', pattern: /Seguran/ },
      { path: '/cookies', pattern: /Cookies/ },
      { path: '/materiais', pattern: /Materiais/ },
      { path: '/status', pattern: /Status/ },
    ]
    for (const { path, pattern } of pages) {
      await page.goto(path)
      await expect(page).toHaveTitle(pattern)
    }
  })

  test('JSON-LD script is present on homepage', async ({ page }) => {
    await page.goto('/')
    const scripts = page.locator('script[type="application/ld+json"]')
    const count = await scripts.count()
    expect(count).toBeGreaterThanOrEqual(1)
    const text = await scripts.first().textContent()
    expect(text).toContain('schema.org')
  })
})

test.describe('SEO — Sitemap', () => {
  test('sitemap.xml is accessible', async ({ page }) => {
    const resp = await page.request.get('/sitemap.xml')
    expect(resp.ok()).toBeTruthy()
    const text = await resp.text()
    expect(text).toContain('<urlset')
    expect(text).toContain('https://useevolua.com.br/')
    expect(text).toContain('<priority>1.0</priority>')
  })
})

test.describe('SEO — Robots', () => {
  test('robots.txt is accessible', async ({ page }) => {
    const resp = await page.request.get('/robots.txt')
    expect(resp.ok()).toBeTruthy()
  })
})

test.describe('Landing — Navigation', () => {
  test('header links navigate correctly', async ({ page }) => {
    await page.goto('/')
    const links = [
      { href: '/planos', title: /Planos|EVOLUA/ },
      { href: '/sobre', title: /Sobre|EVOLUA/ },
      { href: '/blog', title: /Blog|EVOLUA/ },
      { href: '/ajuda', title: /Ajuda|EVOLUA/ },
    ]
    for (const { href, title } of links) {
      const link = page.locator(`a[href="${href}"]`).first()
      if (await link.isVisible()) {
        await link.click()
        await expect(page).toHaveTitle(title)
        await page.goBack()
      }
    }
  })

  test('footer legal links work', async ({ page }) => {
    await page.goto('/')
    const links = ['/termos', '/privacidade', '/cookies', '/seguranca']
    for (const href of links) {
      const link = page.locator(`footer a[href="${href}"], a[href="${href}"]`).last()
      if (await link.isVisible()) {
        await link.click()
        await expect(page.locator('h1').first()).toBeVisible()
        await page.goBack()
      }
    }
  })
})
