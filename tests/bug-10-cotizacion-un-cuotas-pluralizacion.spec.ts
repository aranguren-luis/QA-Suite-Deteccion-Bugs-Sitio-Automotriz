// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership fixed the singular/plural template for "1 cuota" - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-10: panel derecho dice "1 cuotas" mientras el panel resumen dice "1 Cuota"', async ({ page }) => {
  await page.goto('/catalogo/1');
  await page.waitForLoadState('networkidle');

  await page.getByText('COTIZAR AQUÍ', { exact: true }).first().click();
  await page.waitForURL('**/cotizacion');
  await page.waitForLoadState('networkidle');

  const bodyText = await page.locator('body').innerText();

  expect(bodyText).toMatch(/CUOTAS\s*\n*\s*1 cuotas/);
  expect(bodyText).toContain('1 Cuota');
  expect(bodyText).not.toContain('1 cuota\n');
});
