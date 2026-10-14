// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership replaced the placeholder article - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-06: artículo de relleno "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR" publicado en Noticias', async ({ page }) => {
  await page.goto('/noticias');
  await page.waitForLoadState('networkidle');

  const loremHeading = page.getByRole('heading', { name: 'LOREM IPSUM DOLOR SIT AMET, CONSECTETUR' });
  await expect(loremHeading).toBeVisible();
});
