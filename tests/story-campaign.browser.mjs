import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.ENCARA_PREVIEW_URL || 'http://127.0.0.1:3007';

test('Story campaign stays centered, uncropped, text-free and accessible at every target width', async () => {
  const browser = await chromium.launch({ channel: process.env.ENCARA_BROWSER || 'chrome' });
  try {
    for (const width of [320, 390, 608, 692, 768, 1440, 1920, 2560]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const imageRequests = [];
      page.on('request', request => { if (request.resourceType() === 'image') imageRequests.push(request.url()); });
      await page.goto(new URL('/home', baseURL).href, { waitUntil: 'networkidle' });
      await page.getByRole('link', { name: 'Our story', exact: true }).first().click();
      assert.equal(new URL(page.url()).hash, '#story');
      const photo = page.locator('.story-campaign img');
      await photo.evaluate(img => img.decode());
      const state = await photo.evaluate(img => {
        const r = img.getBoundingClientRect(), s = getComputedStyle(img);
        const figure = img.closest('figure'), section = img.closest('section');
        return {
          width: r.width, height: r.height, center: r.x + r.width / 2, left: r.left,
          source: img.currentSrc, intrinsic: [img.getAttribute('width'), img.getAttribute('height')],
          fit: s.objectFit, filter: s.filter, border: s.borderWidth,
          figureText: figure.textContent.trim(), figureChildren: figure.children.length,
          heading: document.getElementById(section.getAttribute('aria-labelledby'))?.tagName,
          background: getComputedStyle(section).backgroundColor,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      assert.ok(state.source.includes('/_next/image?') && state.source.includes('encara-city-football'));
      assert.deepEqual(state.intrinsic, ['1200', '1561']);
      assert.ok(Math.abs(state.width / state.height - 1200 / 1561) < 0.0001);
      assert.equal(state.width, Math.min(width - 48, 800));
      assert.ok(Math.abs(state.center - width / 2) < 1);
      assert.ok(state.left >= 24);
      assert.notEqual(state.fit, 'cover');
      assert.equal(state.filter, 'none');
      assert.equal(state.border, '0px');
      assert.equal(state.figureText, '');
      assert.equal(state.figureChildren, 1);
      assert.equal(state.heading, 'H2');
      assert.equal(state.background, 'rgba(0, 0, 0, 0)');
      assert.equal(state.overflow, false);
      assert.equal(await page.locator('.story-spread, .story-statement, .story-photo').count(), 0);
      assert.doesNotMatch(await page.locator('body').innerText(), /Fear does not always mean stop|Sometimes, it means go|The story \/ ENCARA|ENCARA is not about being fearless/);
      assert.ok(!imageRequests.some(url => url.includes('street-bus')));
      await page.close();
    }
  } finally { await browser.close(); }
});
