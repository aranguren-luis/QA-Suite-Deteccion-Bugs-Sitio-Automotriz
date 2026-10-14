// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING on QA, the dealership fixed the SEO base URL env var for this environment - re-audit and update ../report/hallazgos-sitio-automotriz.md.
// This bug is QA-only by design (contrast test against production is included below).
import { test, expect } from '@playwright/test';

test('BUG-14: robots.txt y sitemap.xml apuntan a localhost:3000 en QA', async ({ request }) => {
  const robotsResponse = await request.get('/robots.txt');
  const robotsBody = await robotsResponse.text();
  expect(robotsBody).toContain('Sitemap: https://localhost:3000/sitemap.xml');
  expect(robotsBody).toContain('Allow: /');

  const sitemapResponse = await request.get('/sitemap.xml');
  const sitemapBody = await sitemapResponse.text();
  expect(sitemapBody).toContain('<loc>https://localhost:3000</loc>');
});

test('BUG-14: canonical, og:image y JSON-LD de Home apuntan a localhost:3000 en QA', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonical).toContain('localhost:3000');

  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(ogImage).toContain('localhost:3000');

  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(jsonLd).toBeTruthy();
  const parsed = JSON.parse(jsonLd as string);
  expect(parsed.url).toContain('localhost:3000');
});

test('BUG-14 (contraste con producción): canonical de producción NO apunta a localhost', async ({ browser }) => {
  const prodUrl = process.env.PROD_URL;
  if (!prodUrl) throw new Error('PROD_URL env var is required for this production cross-check test');
  const context = await browser.newContext({ baseURL: prodUrl });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).not.toContain('localhost:3000');
  } finally {
    await context.close();
  }
});
