// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership uploaded real photos for these models - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

const VEHICLES_WITHOUT_PHOTO = [
  'LA VENEZOLANA 4X2 DIÉSEL 2.8L',
  'T5 LA VENEZOLANA 4X2 DIÉSEL 2.8L',
  'AVENTURA 4X4 AUTOMÁTICA',
];

test('BUG-02: 3 vehículos del catálogo usan el placeholder sin-foto-v2.png', async ({ page }) => {
  await page.goto('/catalogo');
  await page.waitForLoadState('networkidle');

  for (const vehicleName of VEHICLES_WITHOUT_PHOTO) {
    const img = page.locator(`img[alt="${vehicleName}"]`).first();
    await expect(img).toBeVisible();
    const src = await img.evaluate((el: HTMLImageElement) => el.currentSrc || el.src);
    expect(src).toContain('sin-foto-v2.png');
  }
});
