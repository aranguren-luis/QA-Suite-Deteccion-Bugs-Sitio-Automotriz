// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership assigned unique photos to these two pickups - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-03: "LA VENEZOLANA PRO 4X4" y "PICKUP LIMITED AUTOMÁTICA" comparten la misma foto', async ({ page }) => {
  await page.goto('/catalogo?category=pickups');
  await page.waitForLoadState('networkidle');

  const img1 = page.locator('img[alt="LA VENEZOLANA PRO 4X4"]').first();
  const img2 = page.locator('img[alt="PICKUP LIMITED AUTOMÁTICA"]').first();

  await expect(img1).toBeVisible();
  await expect(img2).toBeVisible();

  const src1 = await img1.evaluate((el: HTMLImageElement) => el.currentSrc || el.src);
  const src2 = await img2.evaluate((el: HTMLImageElement) => el.currentSrc || el.src);

  expect(src1).toContain('venezolana-pro.png');
  expect(src2).toContain('venezolana-pro.png');
});
