// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership parametrized Open Graph metadata per page - re-audit and update ../report/hallazgos-sitio-automotriz.md.
import { test, expect } from '@playwright/test';

async function readMeta(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const get = (sel: string) => document.querySelector(sel)?.getAttribute('content') ?? null;
    return {
      title: document.title,
      ogTitle: get('meta[property="og:title"]'),
      ogDescription: get('meta[property="og:description"]'),
      ogImage: get('meta[property="og:image"]'),
    };
  });
}

test('BUG-15: og:title/description/image son idénticos en /catalogo/1, /noticias y /servicios, pero <title> sí varía', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  const pages = ['/catalogo/1', '/noticias', '/servicios'];
  const metas = [];
  for (const path of pages) {
    await page.goto(path);
    await page.waitForLoadState('domcontentloaded');
    metas.push(await readMeta(page));
  }

  const [a, b, c] = metas;
  expect(a.ogTitle).toBe(b.ogTitle);
  expect(b.ogTitle).toBe(c.ogTitle);
  expect(a.ogDescription).toBe(b.ogDescription);
  expect(b.ogDescription).toBe(c.ogDescription);
  expect(a.ogImage).toBe(b.ogImage);
  expect(b.ogImage).toBe(c.ogImage);

  const titles = metas.map((m) => m.title);
  expect(new Set(titles).size).toBe(titles.length);
});
