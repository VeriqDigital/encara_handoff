import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.ENCARA_PREVIEW_URL || 'http://127.0.0.1:3007';
const launch = () => chromium.launch({ channel: process.env.ENCARA_BROWSER || 'chrome' });
const enter = page => page.getByRole('link', { name: 'Enter ENCARA homepage' });
const playing = page => page.waitForFunction(() => {
  const v = document.getElementById('background-video');
  return v && !v.paused && v.readyState >= 2 && v.currentTime > 0;
});
const qa = process.env.ENCARA_QA_DIR;
if (qa) mkdirSync(qa, { recursive: true });

async function screenshot(page, name) {
  if (qa) await page.screenshot({ path: `${qa}/${name}.png` });
}

async function expectPoster(page) {
  assert.equal(await page.locator('video').count(), 0);
  const poster = page.locator('.cinematic-background img');
  await poster.evaluate(img => img.decode());
  assert.match(await poster.getAttribute('src'), /encara-pier-poster.jpg/);
  assert.equal(await page.getByRole('button', { name: /video/ }).count(), 0);
}

test('one video survives Enter and scrolling with advancing frames, no seek/reload, and the 850ms reveal at six widths', async () => {
  const browser = await launch();
  const results = [];
  try {
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'no-preference', isMobile: width < 500, hasTouch: width < 500 });
      const errors = [], requests = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('request', r => { if (r.url().includes('.mp4')) requests.push(r.url()); });
      await page.goto(baseURL, { waitUntil: 'networkidle' });
      await playing(page);
      await page.evaluate(() => {
        window.__player = document.getElementById('background-video');
        window.__events = { seeking: 0, loadstart: 0, pause: 0, play: 0 };
        window.__frames = [];
        for (const event of Object.keys(window.__events)) window.__player.addEventListener(event, () => window.__events[event]++);
        const frame = (_, metadata) => {
          window.__frames.push(metadata.mediaTime);
          window.__player.requestVideoFrameCallback(frame);
        };
        window.__player.requestVideoFrameCallback(frame);
      });
      const clip = { x: 0, y: 50, width: Math.floor(width / 2), height: 200 };
      const frameA = await page.screenshot({ clip });
      await page.waitForTimeout(250);
      const frameB = await page.screenshot({ clip });
      assert.notDeepEqual(frameA, frameB, 'Footage visibly changes before entrance');
      if (qa && width === 1440) {
        writeFileSync(`${qa}/1440-frame-a.png`, frameA);
        writeFileSync(`${qa}/1440-frame-b.png`, frameB);
      }
      await screenshot(page, `${width}-entrance`);
      const requestCount = requests.length;
      const link = enter(page);
      const rect = await link.boundingBox();
      assert.ok(Math.abs(rect.x + rect.width / 2 - width / 2) < 1);
      assert.ok(Math.abs(rect.y + rect.height / 2 - 450) < 1);
      assert.ok(rect.width >= 224 && rect.height >= 76);
      if (width === 390) {
        await link.focus();
        assert.equal(await link.evaluate(e => getComputedStyle(e).outlineStyle), 'solid');
        await page.keyboard.press('Enter');
      } else await link.click();
      await page.waitForFunction(() => {
        const e = document.querySelector('[data-leaving="true"]');
        const opacity = e && Number(getComputedStyle(e).opacity);
        return opacity > 0 && opacity < 1;
      });
      await screenshot(page, `${width}-entrance-fading`);
      // Repeated activation cannot create another navigation/transition.
      await link.dispatchEvent('click');
      await page.waitForURL('**/home');
      await page.waitForFunction(() => {
        const e = document.querySelector('.home-foreground');
        const opacity = e && Number(getComputedStyle(e).opacity);
        return opacity > 0 && opacity < 1;
      });
      await screenshot(page, `${width}-home-fading`);
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.home-foreground')).opacity === '1');
      const continuity = await page.evaluate(() => ({
        same: window.__player === document.getElementById('background-video'),
        events: window.__events, frames: window.__frames,
        paused: window.__player.paused,
        active: document.activeElement?.id || document.activeElement?.tagName,
      }));
      assert.equal(continuity.same, true);
      assert.equal(continuity.paused, false);
      assert.deepEqual(continuity.events, { seeking: 0, loadstart: 0, pause: 0, play: 0 });
      assert.ok(continuity.frames.length > 10);
      assert.ok(new Set(continuity.frames).size > 10, 'Decoded media time advances through Enter');
      assert.equal(requests.length, requestCount, 'Enter does not request the MP4 again');
      await screenshot(page, `${width}-home`);
      for (const selector of ['.piece-section', '.story-campaign', '.manifesto-panel', '.closing', '.site-footer']) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        const state = await page.evaluate(selector => {
          const v = document.getElementById('background-video'), r = v.getBoundingClientRect();
          return {
            count: document.querySelectorAll('video').length,
            same: window.__player === v, paused: v.paused, fit: getComputedStyle(v).objectFit,
            rect: [r.x, r.y, r.width, r.height], viewport: [innerWidth, innerHeight],
            background: getComputedStyle(document.querySelector(selector)).backgroundColor,
            overflow: document.documentElement.scrollWidth > innerWidth,
            muted: v.muted && v.defaultMuted, loop: v.loop, inline: v.playsInline,
          };
        }, selector);
        assert.equal(state.count, 1);
        assert.equal(state.same, true);
        assert.equal(state.paused, false);
        assert.equal(state.fit, 'cover');
        assert.deepEqual(state.rect, [0, 0, ...state.viewport]);
        assert.equal(state.background, 'rgba(0, 0, 0, 0)');
        assert.equal(state.overflow, false);
        assert.equal(state.muted && state.loop && state.inline, true);
        if (selector === '.manifesto-panel') await screenshot(page, `${width}-manifesto`);
      }
      await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      const footerLink = page.locator('.site-footer nav a').last();
      assert.equal(await footerLink.evaluate(a => {
        const r = a.getBoundingClientRect();
        return a.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }), true, 'Shared control must not intercept footer navigation');
      assert.deepEqual(errors, []);
      results.push({ width, ...continuity, requests });
      await page.close();
    }
    if (qa) writeFileSync(`${qa}/continuity.json`, JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
});

test('shared pause control works by keyboard and preserves paused position across Enter and browser history', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.goto(baseURL);
    await playing(page);
    const control = page.getByRole('button', { name: 'Pause video', exact: true });
    await control.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('video').paused);
    const video = await page.locator('video').elementHandle();
    const time = await video.evaluate(v => v.currentTime);
    await enter(page).click();
    await page.waitForURL('**/home');
    await page.waitForTimeout(600);
    assert.equal(await video.evaluate(v => v === document.querySelector('video')), true);
    assert.equal(await video.evaluate(v => v.currentTime), time);
    await page.goBack();
    assert.equal(new URL(page.url()).pathname, '/');
    assert.equal(await video.evaluate(v => v === document.querySelector('video')), true);
    await page.getByRole('button', { name: 'Play video', exact: true }).click();
    await playing(page);
    await page.goForward();
    await page.waitForURL('**/home');
    await page.reload();
    await playing(page);
    assert.equal(await page.locator('video').count(), 1);
  } finally { await browser.close(); }
});

test('Enter and the homepage skip link remain first in their keyboard navigation order', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    assert.equal(await enter(page).evaluate(e => document.activeElement === e), true);
    await page.keyboard.press('Enter');
    await page.waitForURL('**/home');
    await page.reload({ waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Skip to content');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
  } finally { await browser.close(); }
});

test('reduced motion at startup and live changes retain poster, omit MP4, and minimize the entrance transition', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const requests = [];
    page.on('request', r => { if (r.url().includes('.mp4')) requests.push(r.url()); });
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await expectPoster(page);
    assert.equal(await enter(page).evaluate(e => getComputedStyle(e).transitionDuration), '0s');
    await enter(page).click();
    await page.waitForURL('**/home');
    await expectPoster(page);
    assert.equal(await page.locator('.home-foreground').evaluate(e => getComputedStyle(e).animationName), 'none');
    assert.deepEqual(requests, []);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await playing(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => !document.querySelector('video'));
    await expectPoster(page);
  } finally { await browser.close(); }
});

test('no-JS entrance, direct homepage, anchors and static imagery remain usable without video downloads', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ javaScriptEnabled: false });
    const requests = [];
    page.on('request', r => { if (r.url().includes('.mp4')) requests.push(r.url()); });
    await page.goto(baseURL);
    await expectPoster(page);
    await enter(page).click();
    await page.waitForURL('**/home');
    await expectPoster(page);
    // Native CSS runs with scripting disabled; Playwright's rAF polling does
    // not. Check the settled appearance after the 450ms animation instead.
    await page.waitForTimeout(600);
    assert.equal(await page.locator('.home-foreground').evaluate(e => getComputedStyle(e).opacity), '1');
    await page.getByRole('link', { name: 'Explore the piece', exact: true }).first().click();
    await page.waitForURL('**/home#piece');
    assert.equal(await page.locator('.piece-price').innerText(), '$50');
    assert.deepEqual(requests, []);
  } finally { await browser.close(); }
});

test('genuine media failure leaves the pier poster and a usable entrance/homepage', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.route('**/encara-pier-monochrome.mp4', r => r.abort('failed'));
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.querySelector('video'));
    await expectPoster(page);
    await enter(page).click();
    await page.waitForURL('**/home');
    await expectPoster(page);
    await screenshot(page, 'media-failure');
  } finally { await browser.close(); }
});

test('autoplay denial retains the poster and manual play retries the same shared element', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        if (!window.__allowPlay) { this.pause(); return Promise.reject(new DOMException('Blocked', 'NotAllowedError')); }
        return play.call(this);
      };
      document.addEventListener('play', e => { if (!window.__allowPlay && e.target instanceof HTMLVideoElement) e.target.pause(); }, true);
    });
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    const control = page.getByRole('button', { name: 'Play video', exact: true });
    await control.waitFor();
    const video = await page.locator('video').elementHandle();
    assert.equal(await video.evaluate(v => v.paused), true);
    assert.match(await video.getAttribute('poster'), /encara-pier-poster/);
    await page.evaluate(() => { window.__allowPlay = true; });
    await control.click();
    await playing(page);
    assert.equal(await video.evaluate(v => v === document.querySelector('video')), true);
  } finally { await browser.close(); }
});

test('viewport height changes and landscape retain full coverage without overflow', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ isMobile: true, hasTouch: true });
    await page.goto(baseURL);
    await playing(page);
    for (const viewport of [{ width: 390, height: 844 }, { width: 390, height: 650 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(viewport);
      assert.deepEqual(await page.locator('video').evaluate(v => {
        const r = v.getBoundingClientRect(); return [r.x, r.y, r.width, r.height];
      }), [0, 0, viewport.width, viewport.height]);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
  } finally { await browser.close(); }
});

test('prolonged network loading and simulated stalled events fall back to the poster', async () => {
  const browser = await launch();
  try {
    const loading = await browser.newPage();
    await loading.route('**/encara-pier-monochrome.mp4', () => {});
    await loading.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await loading.locator('video').waitFor();
    await loading.waitForFunction(() => !document.querySelector('video'), null, { timeout: 12000 });
    await expectPoster(loading);
    await loading.close();
    const stalled = await browser.newPage();
    await stalled.addInitScript(() => {
      // A healthy native loop emits playing again. Hold those recovery events
      // to exercise an unrecovered stall, without changing production code.
      document.addEventListener('playing', e => { if (window.__stall) e.stopImmediatePropagation(); }, true);
    });
    await stalled.goto(baseURL);
    await playing(stalled);
    await stalled.evaluate(() => {
      window.__stall = true;
      document.querySelector('video').dispatchEvent(new Event('stalled'));
      // Repeated buffering notifications must keep the original deadline.
      window.__stallTimer = setInterval(() => document.querySelector('video')?.dispatchEvent(new Event('stalled')), 1000);
    });
    await stalled.waitForFunction(() => !document.querySelector('video'), null, { timeout: 12000 });
    await expectPoster(stalled);
  } finally { await browser.close(); }
});

test('development cleanup ignores a delayed stale AbortError after a motion-preference change', { skip: !process.env.ENCARA_DEV_URL }, async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      const play = HTMLMediaElement.prototype.play;
      window.__plays = 0;
      HTMLMediaElement.prototype.play = function () {
        window.__plays++;
        const attempt = play.call(this);
        if (window.__plays === 1) return new Promise((_, reject) => {
          attempt.catch(() => {});
          window.__rejectOldPlay = () => reject(new DOMException('Superseded', 'AbortError'));
        });
        return attempt;
      };
    });
    await page.goto(process.env.ENCARA_DEV_URL, { waitUntil: 'networkidle' });
    await playing(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => !document.querySelector('video'));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await playing(page);
    await page.evaluate(() => window.__rejectOldPlay());
    await page.waitForTimeout(200);
    await playing(page);
    assert.ok(await page.evaluate(() => window.__plays >= 2), 'Cancelled setup and newer playback both exercised');
    assert.equal(await page.getByRole('button', { name: 'Pause video', exact: true }).count(), 1);
    assert.equal(await page.locator('video').count(), 1);
  } finally { await browser.close(); }
});
