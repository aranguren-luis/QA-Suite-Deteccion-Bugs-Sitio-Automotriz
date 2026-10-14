// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership pointed these icons to its official social media profiles - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

async function assertGenericSocialLinks(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle');

  await expect(page.locator('footer a[aria-label="Instagram"]')).toHaveAttribute('href', 'https://instagram.com/');
  await expect(page.locator('footer a[aria-label="Facebook"]')).toHaveAttribute('href', 'https://facebook.com/');
  await expect(page.locator('footer a[aria-label="TikTok"]')).toHaveAttribute('href', 'https://tiktok.com/');

  const whatsappHref = await page.locator('footer a[aria-label="WhatsApp"]').getAttribute('href');
  expect(whatsappHref).toContain('wa.me/15550123456');
}

test('BUG-20 (QA): íconos de Instagram/Facebook/TikTok del footer apuntan a la homepage genérica', async ({ page }) => {
  await page.goto('/');
  await assertGenericSocialLinks(page);
});

test('BUG-20 (producción, contraste): producción mantiene los mismos links genéricos', async ({ browser }) => {
  const prodUrl = process.env.PROD_URL;
  if (!prodUrl) throw new Error('PROD_URL env var is required for this production cross-check test');
  const context = await browser.newContext({ baseURL: prodUrl });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await assertGenericSocialLinks(page);
  } finally {
    await context.close();
  }
});
