// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership removed the unoptimized background-image duplicate of the carousel photo - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

test('BUG-17: Home carga la imagen del carrusel dos veces (optimizada + sin optimizar como background-image)', async ({ page }) => {
  const optimizedResponsePromise = page.waitForResponse(
    (response) => response.url().includes('_next/image') && response.url().includes('carousel%2Fimage.png'),
    { timeout: 20_000 }
  );
  const unoptimizedResponsePromise = page.waitForResponse(
    (response) => response.url().endsWith('/images/carousel/image.png'),
    { timeout: 20_000 }
  );

  await page.goto('/');

  const [optimizedResponse, unoptimizedResponse] = await Promise.all([
    optimizedResponsePromise,
    unoptimizedResponsePromise,
  ]);

  const optimizedBody = await optimizedResponse.body();
  const unoptimizedBody = await unoptimizedResponse.body();

  expect(unoptimizedBody.length).toBeGreaterThan(1_000_000);
  expect(unoptimizedBody.length).toBeGreaterThan(optimizedBody.length);

  const carouselDivBackground = await page.evaluate(() => {
    const el = document.querySelector('div.absolute.inset-0.bg-cover.bg-center');
    return el ? getComputedStyle(el).backgroundImage : null;
  });
  expect(carouselDivBackground).toContain('carousel/image.png');
  expect(carouselDivBackground).not.toContain('_next/image');
});
