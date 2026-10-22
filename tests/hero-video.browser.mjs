// Run against `npm start` with Playwright installed for browser testing.
// No browser package is added to the application dependencies.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');

const baseURL = new URL('/home', process.env.ENCARA_PREVIEW_URL || 'http://127.0.0.1:3007').href;

test('desktop hero retains the original four-line display headline', async () => {
  const browser = await chromium.launch({ channel: process.env.ENCARA_BROWSER || 'chrome' });
  try {
    // Display sizing must preserve the four-line headline at desktop widths.
    for (const [width, height, fontSize] of [[1440, 900, 97.92], [1920, 1080, 112], [2560, 1400, 112]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      await page.goto(baseURL, { waitUntil: 'networkidle' });
      const headline = await page.locator('.campaign h1').evaluate(element => {
        const style = getComputedStyle(element);
        return {
          fontSize: parseFloat(style.fontSize),
          lineHeight: parseFloat(style.lineHeight),
          letterSpacing: parseFloat(style.letterSpacing),
          fontWeight: style.fontWeight,
          textTransform: style.textTransform,
          height: element.getBoundingClientRect().height,
        };
      });
      assert.ok(Math.abs(headline.fontSize - fontSize) < 0.1, `${width}px: expected display size ${fontSize}px, got ${headline.fontSize}px`);
      assert.ok(Math.abs(headline.lineHeight - fontSize * 0.96) < 0.1);
      assert.ok(Math.abs(headline.letterSpacing - fontSize * -0.065) < 0.1);
      assert.equal(headline.fontWeight, '400');
      assert.equal(headline.textTransform, 'uppercase');
      assert.ok(Math.abs(headline.height / headline.lineHeight - 4) < 0.05, 'The original headline must occupy four lines');
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
