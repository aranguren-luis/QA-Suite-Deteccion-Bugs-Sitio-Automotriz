// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership added the missing tildes - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-04: footer dice "CATEGORIA" sin tilde', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const firstFooterHeading = page.locator('footer h3').first();
  await expect(firstFooterHeading).toHaveText('CATEGORIA');
  await expect(firstFooterHeading).not.toHaveText('CATEGORÍA');
});

test('BUG-04: /garantia dice "GARANTIA" sin tilde antes de "Años de Tranquilidad Absoluta"', async ({ page }) => {
  await page.goto('/garantia');
  await page.waitForLoadState('networkidle');

  const bodyText = await page.locator('body').innerText();
  expect(bodyText).toMatch(/GARANTIA\s*\n*\s*Años de Tranquilidad Absoluta/);
  expect(bodyText).not.toMatch(/GARANTÍA\s*\n*\s*Años de Tranquilidad Absoluta/);
});

test('BUG-04: panel de cotización en ficha de vehículo también dice "GARANTIA" sin tilde', async ({ page }) => {
  await page.goto('/catalogo/1');
  await page.waitForLoadState('networkidle');
  await page.getByText('COTIZAR AQUÍ', { exact: true }).first().click();
  await page.waitForURL('**/cotizacion');
  await page.waitForLoadState('networkidle');

  const bodyText = await page.locator('body').innerText();
  expect(bodyText).toMatch(/GARANTIA\s*\n*\s*Años de Tranquilidad Absoluta/);
});
