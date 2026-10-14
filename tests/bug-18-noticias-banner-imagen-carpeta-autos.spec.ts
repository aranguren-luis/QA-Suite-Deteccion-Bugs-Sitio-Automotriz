// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership moved/renamed the banner image out of images/autos - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-18: banner "EL EXPERIENCE FEST YA ESTÁ AQUÍ." se sirve desde images/autos/vehicle-photo-misplaced.png', async ({ page }) => {
  await page.goto('/noticias');
  await page.waitForLoadState('networkidle');

  const banner = page.locator('img[alt="EL EXPERIENCE FEST YA ESTÁ AQUÍ."]');
  await expect(banner).toBeVisible();

  const src = await banner.evaluate((el: HTMLImageElement) => el.currentSrc || el.src);
  expect(decodeURIComponent(src)).toContain('/images/autos/vehicle-photo-misplaced.png');
});
