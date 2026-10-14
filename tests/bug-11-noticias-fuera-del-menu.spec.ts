// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership added "Noticias" to the main nav - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-11: "Noticias" no aparece en el header/nav principal pero sí en el footer', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const headerNavNoticias = page.locator('header a, nav a').filter({ hasText: /^Noticias$/i });
  await expect(headerNavNoticias).toHaveCount(0);

  const footerNoticias = page.locator('footer a[href="/noticias"]');
  await expect(footerNoticias).toBeVisible();
});
