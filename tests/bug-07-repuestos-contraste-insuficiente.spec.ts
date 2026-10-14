// Bug-detection suite: a PASSING test here confirms the bug is still present (expected today).
// If this test starts FAILING, the dealership strengthened the dark overlay over these cards - re-audit and update ../report/hallazgos-sitio-automotriz.md.
// Method: screenshot each card, decode the PNG in Node (tests/png-decode.ts, no extra deps), find the
// brightest background pixel directly behind the title text (excluding the white glyph pixels themselves,
// brightness >= 225), and compute WCAG relative-luminance contrast (tests/helpers.ts) between that pixel
// and the title's own getComputedStyle color. A ratio below 4.5 confirms insufficient AA contrast.
import { test, expect } from '@playwright/test';
import { decodePng, worstCaseBackgroundBrightness } from './png-decode';
import { contrastRatio, parseRgb } from './helpers';

const LOW_CONTRAST_CARD_TITLES = ['CARROCERÍA E ILUMINACIÓN', 'ACCESORIOS Y CONFORT'];

test.describe('BUG-07: contraste insuficiente en tarjetas de /repuestos', () => {
  for (const title of LOW_CONTRAST_CARD_TITLES) {
    test(`"${title}" tiene contraste texto/fondo < 4.5`, async ({ page }) => {
      await page.goto('/repuestos');
      await page.waitForLoadState('networkidle');

      const heading = page.locator('h3', { hasText: title });
      const card = heading.locator('xpath=ancestor::button[1]');

      const cardBox = await card.boundingBox();
      const headingBox = await heading.boundingBox();
      expect(cardBox).not.toBeNull();
      expect(headingBox).not.toBeNull();
      if (!cardBox || !headingBox) return;

      const textColor = await heading.evaluate((el) => getComputedStyle(el).color);
      const buffer = await card.screenshot();
      const png = decodePng(buffer);

      const relRect = {
        x: headingBox.x - cardBox.x,
        y: headingBox.y - cardBox.y,
        width: headingBox.width,
        height: headingBox.height,
      };
      const worstBackgroundBrightness = worstCaseBackgroundBrightness(png, relRect);
      const bgGray: [number, number, number] = [worstBackgroundBrightness, worstBackgroundBrightness, worstBackgroundBrightness];
      const ratio = contrastRatio(parseRgb(textColor), bgGray);

      console.log(`BUG-07 [${title}] contrast ratio: ${ratio.toFixed(2)} (text ${textColor}, worst bg gray ${worstBackgroundBrightness.toFixed(0)})`);
      expect(ratio).toBeLessThan(4.5);
    });
  }
});
