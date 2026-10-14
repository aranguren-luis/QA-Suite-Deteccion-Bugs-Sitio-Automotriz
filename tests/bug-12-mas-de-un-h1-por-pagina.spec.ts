// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership fixed the heading hierarchy on that page - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

const PAGES_WITH_MULTIPLE_H1: Array<{ path: string; minCount: number }> = [
  { path: '/sobre-nosotros', minCount: 2 },
  { path: '/catalogo', minCount: 2 },
  { path: '/servicios', minCount: 2 },
  { path: '/repuestos', minCount: 3 },
  { path: '/noticias', minCount: 2 },
  { path: '/garantia', minCount: 2 },
  { path: '/tipos-de-compra', minCount: 3 },
];

test.describe('BUG-12: más de un <h1> por página', () => {
  for (const { path, minCount } of PAGES_WITH_MULTIPLE_H1) {
    test(`${path} tiene >= ${minCount} <h1>`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(minCount);
    });
  }
});
