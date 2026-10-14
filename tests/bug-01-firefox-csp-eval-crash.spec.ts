// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING in the future, it means the dealership fixed the CSP/eval issue in Firefox — re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-01: Firefox blocks a JavaScript eval due to missing unsafe-eval in script-src CSP', async ({ page }) => {
  const cspMessages: string[] = [];
  page.on('console', (msg) => {
    if (/script-src.*unsafe-eval|blocked a JavaScript eval/i.test(msg.text())) {
      cspMessages.push(msg.text());
    }
  });

  await page.goto('/tipos-de-compra');
  await page.waitForLoadState('networkidle');

  expect(cspMessages.length).toBeGreaterThan(0);
  expect(cspMessages[0]).toMatch(/script-src.*unsafe-eval|blocked a JavaScript eval/i);
});

test('BUG-01 (best-effort): intermittent "App Error" crash across repeated reloads in Firefox', async ({ page }) => {
  test.slow();
  const reloadCount = 12;
  let appErrorCount = 0;

  await page.goto('/tipos-de-compra');
  for (let i = 0; i < reloadCount; i++) {
    await page.reload({ waitUntil: 'networkidle' }).catch(() => undefined);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    if (/app error|application error|something went wrong/i.test(bodyText)) {
      appErrorCount += 1;
    }
  }

  test.info().annotations.push({
    type: 'bug-01-intermittent-crash-ratio',
    description: `${appErrorCount}/${reloadCount} reloads showed an application error (expected ~1/9, non-deterministic)`,
  });
  console.log(`BUG-01 intermittent crash ratio: ${appErrorCount}/${reloadCount}`);
});
