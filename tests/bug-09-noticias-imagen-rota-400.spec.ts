// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership fixed the broken elite.png image response - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-09: imagen del artículo destacado (elite.png) responde 400', async ({ page }) => {
  const eliteResponses: number[] = [];
  page.on('response', (response) => {
    if (/elite\.png/i.test(response.url())) {
      eliteResponses.push(response.status());
    }
  });

  await page.goto('/noticias');
  await page.waitForLoadState('networkidle');

  expect(eliteResponses.length).toBeGreaterThan(0);
  expect(eliteResponses).toContain(400);
});
