// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership added a nonce to style-src-attr - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-16: CSP permite style-src-attr \'unsafe-inline\' sin nonce, a diferencia de style-src/style-src-elem', async ({ request }) => {
  const response = await request.get('/');
  const csp = response.headers()['content-security-policy'];
  expect(csp).toBeTruthy();

  expect(csp).toMatch(/style-src-attr\s+'self'\s+'unsafe-inline'/);
  expect(csp).not.toMatch(/style-src-attr[^;]*nonce-/);

  expect(csp).toMatch(/style-src\s+'self'\s+'nonce-/);
  expect(csp).toMatch(/style-src-elem\s+'self'\s+'nonce-/);
});
