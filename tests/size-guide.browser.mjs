import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.ENCARA_PREVIEW_URL || 'http://127.0.0.1:3007';
const expectedRows = [
  ['Measurement', 'S', 'M', 'L'],
  ['Shoulder width', '19.25', '20.50', '21.50'],
  ['Chest width (flat)', '21.00', '22.50', '24.00'],
  ['Sleeve length', '13.50', '15.00', '15.00'],
  ['Garment length', '27.50', '28.75', '29.50'],
];

test('size guide opens and closes with pointer/touch and keyboard without overflow', async () => {
  const browser = await chromium.launch({ channel: process.env.ENCARA_BROWSER || 'chrome' });
  try {
    for (const width of [320, 390, 701, 768, 1024, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width < 500, hasTouch: width < 500 });
      await page.goto(new URL('/home', baseURL).href, { waitUntil: 'networkidle' });
      const guide = page.locator('.size-guide');
      const summary = guide.locator('summary');
      const table = guide.locator('table');
      assert.equal(await table.isVisible(), false);
      if (width < 500) await summary.tap(); else await summary.click();
      await table.waitFor({ state: 'visible' });
      assert.deepEqual(await table.locator('tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.textContent))), expectedRows);
      assert.equal(await table.getAttribute('aria-describedby'), 'piece-measurement-note');
      assert.ok((await page.locator('#piece-measurement-note').innerText()).includes('not body circumference'));
      const geometry = await table.evaluate(table => ({
        width: table.getBoundingClientRect().width,
        container: table.closest('.piece-info').getBoundingClientRect().width,
        pageOverflow: document.documentElement.scrollWidth > innerWidth,
        cellOverflow: [...table.querySelectorAll('th,td')].some(cell => cell.scrollWidth > cell.clientWidth + 1),
      }));
      assert.equal(geometry.width, geometry.container);
      assert.equal(geometry.pageOverflow, false);
      assert.equal(geometry.cellOverflow, false);
      if (width < 500) await summary.tap(); else await summary.click();
      assert.equal(await table.isVisible(), false);
      await summary.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      assert.equal(await summary.evaluate(e => document.activeElement === e), true);
      assert.equal(await summary.evaluate(e => getComputedStyle(e).outlineStyle), 'solid');
      await page.keyboard.press('Enter');
      assert.equal(await table.isVisible(), true);
      await page.keyboard.press('Space');
      assert.equal(await table.isVisible(), false);
      assert.equal(await page.locator('#piece select, #piece input').count(), 0);
      assert.doesNotMatch(await page.locator('#piece').innerText(), /remaining|in stock|120 units|buy now|add to cart/i);
      await page.close();
    }
  } finally { await browser.close(); }
});

test('native disclosure works without JavaScript and respects reduced motion', async () => {
  const browser = await chromium.launch({ channel: process.env.ENCARA_BROWSER || 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false, reducedMotion: 'reduce' });
    await page.goto(new URL('/home', baseURL).href);
    const summary = page.locator('.size-guide summary');
    await summary.click();
    assert.equal(await page.locator('.size-guide table').isVisible(), true);
    assert.equal(await page.locator('.size-guide-content').evaluate(e => getComputedStyle(e).animationName), 'none');
    await summary.click();
    assert.equal(await page.locator('.size-guide table').isVisible(), false);
  } finally { await browser.close(); }
});
