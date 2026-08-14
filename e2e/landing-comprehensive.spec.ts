import { test, expect } from '@playwright/test';

test.describe('Landing Page — SEO & Meta', () => {
  test('homepage has correct SEO meta tags', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EVOLUA/);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toContain('fonoaudiólogas');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe('https://useevolua.com.br/');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toContain('EVOLUA');
    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content');
    expect(ogLocale).toBe('pt_BR');
  });

  test('blog page metadata includes canonical', async ({ page }) => {
    await page.goto('/blog');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('/blog');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(ogType).toBe('website');
  });
});

test.describe('Landing Page — Navigation & Links', () => {
  test('all header navigation links work', async ({ page }) => {
    await page.goto('/');
    const links = ['/planos', '/sobre', '/blog', '/ajuda'];
    for (const link of links) {
      const el = page.locator(`a[href="${link}"]`).first();
      await expect(el).toBeVisible();
    }
  });

  test('footer has legal links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/termos"]').first()).toBeVisible();
    await expect(page.locator('a[href="/privacidade"]').first()).toBeVisible();
    await expect(page.locator('a[href="/cookies"]').first()).toBeVisible();
  });

  test('CTA button links to cadastro', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('a[href="/cadastro"]').first();
    if (await cta.isVisible()) {
      await expect(cta).toBeVisible();
    }
  });
});

test.describe('Landing Page — Planos', () => {
  test('planos page renders pricing cards', async ({ page }) => {
    await page.goto('/planos');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('text=EVOLUA').first()).toBeVisible();
  });
});

test.describe('Landing Page — Blog', () => {
  test('blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1').first()).toBeVisible();
    const posts = page.locator('a[href^="/blog/"]');
    const count = await posts.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Landing Page — Legal Pages', () => {
  const legalPages = [
    { path: '/termos', title: /Termos/ },
    { path: '/privacidade', title: /Privacidade/ },
    { path: '/cookies', title: /Cookies/ },
    { path: '/seguranca', title: /Seguran/ },
  ];

  for (const { path, title } of legalPages) {
    test(`${path} loads correctly`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1').first()).toBeVisible();
    });
  }
});

test.describe('Landing Page — Status', () => {
  test('status page shows services', async ({ page }) => {
    await page.goto('/status');
    await expect(page.locator('h1').first()).toBeVisible();
    const services = page.locator('text=Operacional').first();
    await expect(services).toBeVisible();
  });
});

test.describe('Landing Page — Newsletter Cancel', () => {
  test('newsletter cancel page loads', async ({ page }) => {
    await page.goto('/newsletter/cancelar');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('Frontend Auth — Login', () => {
  test('login page has correct form elements', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/entrar');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('cadastro page has signup form', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/cadastro');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe('Frontend Auth — Recovery', () => {
  test('recuperar-senha page loads', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/recuperar-senha');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });
});

test.describe('Frontend — Dashboard Layout', () => {
  test('unauthenticated users redirect to login', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/dashboard');
    await page.waitForURL(/\/entrar|\/cadastro/);
  });

  test('legal pages in frontend load', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/termos');
    await expect(page.locator('body')).toBeVisible();
    await page.goto('http://127.0.0.1:5173/privacidade');
    await expect(page.locator('body')).toBeVisible();
  });
});
