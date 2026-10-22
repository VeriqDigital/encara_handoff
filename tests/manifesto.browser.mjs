import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { heading, paragraphs } from './fixtures/manifesto.mjs';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = new URL('/home', process.env.ENCARA_PREVIEW_URL || 'http://127.0.0.1:3007').href;
const widths = [320, 390, 768, 1024, 1440, 1920];
const launch = () => chromium.launch({ channel: process.env.ENCARA_BROWSER || 'chrome' });
const normalize = text => text.replace(/\s+/g, ' ').trim();
const approach = page => page.locator('.manifesto').scrollIntoViewIfNeeded();
test('manifesto has readable 4/2/1 columns, original reading order and unchanged campaign photo at all target widths', async () => {
  const browser = await launch();
  try {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: {width, height:900}, reducedMotion:'reduce' });
      await page.goto(baseURL, {waitUntil:'networkidle'});
      await approach(page);
      assert.equal(normalize(await page.locator('#story-heading').innerText()), heading);
      assert.deepEqual((await page.locator('.manifesto-body p').allTextContents()).map(normalize), paragraphs);
      const state = await page.locator('.manifesto').evaluate(e => {
        const s=getComputedStyle(e);
        return {
          columns:s.gridTemplateColumns.split(' ').length,
          rects:[...e.children].map(c=>{const r=c.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width};}),
          textOverflow:[...e.querySelectorAll('p,h2')].some(p=>p.scrollWidth>p.clientWidth+1),
          pageOverflow:document.documentElement.scrollWidth>innerWidth,
          fontSize:parseFloat(getComputedStyle(e.querySelector('.manifesto-body p')).fontSize),
          overlay:getComputedStyle(document.querySelector('.background-shade')).backgroundColor,
        };
      });
      const count = width >= 1024 ? 4 : width >= 701 ? 2 : 1;
      assert.equal(state.columns,count);
      assert.equal(state.textOverflow,false);
      assert.equal(state.pageOverflow,false);
      assert.ok(state.fontSize>=18);
      for (let i=0;i<4;i++) {
        assert.ok(state.rects[i].x>=0 && state.rects[i].x+state.rects[i].width<=width);
        if (i>0 && i%count) assert.equal(state.rects[i].y,state.rects[i-1].y);
        if (i>=count) assert.ok(state.rects[i].y>state.rects[i-count].y);
      }
      assert.equal(state.overlay,'rgba(0, 0, 0, 0.75)');
      const luminance = rgb => rgb.map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum,c,i) => sum + c * [.2126,.7152,.0722][i],0);
      const brightestBackground = luminance([255,255,255].map(c => c * .25));
      assert.ok((luminance([196,192,185])+.05)/(brightestBackground+.05)>=4.5,'Supporting text must contrast even with a white source frame');
      assert.equal(await page.locator('.manifesto-welcome').evaluate(e=>getComputedStyle(e).fontWeight),'700');
      const photo = await page.locator('.story-campaign img').boundingBox();
      assert.equal(photo.width,Math.min(width-48,800));
      assert.ok(Math.abs(photo.width/photo.height-1200/1561)<0.0001);
      assert.ok(Math.abs(photo.x+photo.width/2-width/2)<1);
      if (process.env.ENCARA_QA_DIR) {
        mkdirSync(process.env.ENCARA_QA_DIR,{recursive:true});
        await page.locator('.manifesto-panel').screenshot({path:`${process.env.ENCARA_QA_DIR}/${width}-static.png`});
      }
      await page.close();
    }
  } finally { await browser.close(); }
});
