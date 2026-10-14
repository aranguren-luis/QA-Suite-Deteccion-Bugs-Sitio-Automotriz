// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership fixed the frame-src CSP directive for the map - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-05: el mapa de Google en /sobre-nosotros es bloqueado por CSP (frame-src)', async ({ page }) => {
  const cspMessages: string[] = [];
  page.on('console', (msg) => {
    if (/Framing.*maps\.google\.com.*Content Security Policy/i.test(msg.text())) {
      cspMessages.push(msg.text());
    }
  });

  await page.goto('/sobre-nosotros');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);

  expect(cspMessages.length).toBeGreaterThan(0);
  expect(cspMessages[0]).toMatch(/Framing.*maps\.google\.com.*Content Security Policy/i);
});
