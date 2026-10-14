// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership unified the "Pickups" copy across the site - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-08: tres variantes de copy distintas para la categoría Pickups', async ({ page }) => {
  await page.goto('/catalogo');
  await page.waitForLoadState('networkidle');

  const filterButton = page.getByText(`PICKUP'S`, { exact: true });
  await expect(filterButton).toBeVisible();

  await filterButton.click();
  await page.waitForTimeout(500);

  const sectionHeading = page.getByRole('heading', { name: 'PICK UP', exact: true });
  await expect(sectionHeading).toBeVisible();

  const footerCategoryLink = page.locator('footer a[href="/catalogo?category=pickups"]');
  await expect(footerCategoryLink).toHaveText('PICKUPS');
});
