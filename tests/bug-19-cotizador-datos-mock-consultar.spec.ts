// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership fixed the underlying mock-data pricing (not just the mitigation) - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

async function assertConsultarMitigation(page: import('@playwright/test').Page) {
  await page.goto('/cotizacion');
  await page.waitForLoadState('networkidle');

  await page.getByText('FINANCIAMIENTO AUTO CLUB 24', { exact: true }).first().click();

  await expect
    .poll(async () => page.locator('body').innerText(), { timeout: 10_000 })
    .toMatch(/PRECIO\s*\n*\s*Consultar/);

  const bodyText = await page.locator('body').innerText();
  expect(bodyText).not.toMatch(/PRECIO\s*\n*\s*\$[\d,]+/);

  const waLink = page.locator('a[href*="wa.me"]').filter({ hasText: 'Consultar' }).first();
  await expect(waLink).toBeVisible();
  const href = await waLink.getAttribute('href');
  expect(href).toContain('wa.me/15550123456');
}

test('BUG-19 (QA): Financiamiento Auto Club 24 muestra "Consultar" + botón WhatsApp en vez de un monto', async ({ page }) => {
  await assertConsultarMitigation(page);
});

test('BUG-19 (producción, contraste): producción mantiene la misma mitigación "Consultar"', async ({ browser }) => {
  const prodUrl = process.env.PROD_URL;
  if (!prodUrl) throw new Error('PROD_URL env var is required for this production cross-check test');
  const context = await browser.newContext({ baseURL: prodUrl });
  const page = await context.newPage();
  try {
    await assertConsultarMitigation(page);
  } finally {
    await context.close();
  }
});
