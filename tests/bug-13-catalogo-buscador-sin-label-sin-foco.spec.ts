// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership added an accessible name and/or a visible focus style - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-13: input "Buscar modelo..." sin label accesible ni foco visible', async ({ page }) => {
  await page.goto('/catalogo');
  await page.waitForLoadState('networkidle');

  const searchInput = page.locator('input[placeholder*="Buscar" i]').first();
  await expect(searchInput).toBeVisible();

  const accessibility = await searchInput.evaluate((el: HTMLInputElement) => ({
    id: el.id,
    ariaLabel: el.getAttribute('aria-label'),
    hasAssociatedLabel: !!(el.id && document.querySelector(`label[for="${el.id}"]`)),
  }));

  expect(accessibility.id).toBeFalsy();
  expect(accessibility.ariaLabel).toBeFalsy();
  expect(accessibility.hasAssociatedLabel).toBe(false);

  await searchInput.focus();
  const focusStyle = await searchInput.evaluate((el) => {
    const style = getComputedStyle(el);
    return { outlineStyle: style.outlineStyle, boxShadow: style.boxShadow };
  });

  expect(focusStyle.outlineStyle).toBe('none');
  expect(focusStyle.boxShadow).not.toMatch(/[1-9]\d*px/);
});
