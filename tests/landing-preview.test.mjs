import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { transpileModule, ModuleKind } from 'typescript';

// Production rendering guards the scope, metadata, and source/runtime boundary.
const html = readFileSync(new URL('../.next/server/app/home.html', import.meta.url), 'utf8');
const entrance = readFileSync(new URL('../.next/server/app/index.html', import.meta.url), 'utf8');
const productSource = readFileSync(new URL('../data/product.ts', import.meta.url), 'utf8');
const productModule = transpileModule(productSource, { compilerOptions: { module: ModuleKind.ESNext } }).outputText;
const { piece, initialInventoryTotal } = await import(`data:text/javascript;base64,${Buffer.from(productModule).toString('base64')}`);

test('entrance is a static campaign fallback with a functional homepage link', () => {
  assert.match(entrance, /<main[^>]+aria-label="ENCARA entrance"/);
  assert.match(entrance, /<a[^>]+href="\/home"[^>]*>ENTER<\/a>/);
  assert.match(entrance, /<img[^>]+src="\/videos\/encara\/encara-pier-poster.jpg"/);
  assert.doesNotMatch(entrance, /<video\b|<header\b|<footer\b|<nav\b|<h1\b|<form\b|id="piece"|id="story"/);
  assert.match(entrance, /<title>Enter \| ENCARA<\/title>/);
  assert.match(entrance, /name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(entrance, /rel="canonical"|application\/ld\+json|\[CONFIRM\]/);
});

test('brand, garment, and story are usable in the initial production HTML', () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes('There will always be a reason to wait.'));
  assert.ok(html.includes('id="piece"'));
  assert.ok(html.includes('id="story"'));
  assert.ok(html.indexOf('id="piece"') < html.indexOf('id="story"'));
  assert.doesNotMatch(html, /id="film"|href="\/?#film"|film-section/);
  assert.ok(html.includes('$50'));
  assert.ok(html.includes('Planned presale'));
  assert.ok(html.includes('Presale details to be announced.'));
  assert.ok(html.includes('three friends from Chicago'));
  for (const name of ['hand-behind-head', 'studio-front', 'looking-left', 'city-football']) {
    assert.ok(html.includes(`encara-${name}.`) || html.includes(`encara-studio-${name}.`));
  }
});

test('Story shows the supplied campaign photo without the former quote and retains its manifesto heading', () => {
  assert.doesNotMatch(html, /encara-street-bus|Fear does not always mean stop|Sometimes, it means go|The story \/ ENCARA|ENCARA is not about being fearless/);
  assert.match(html, /<section id="story"[^>]+aria-labelledby="story-heading"/);
  assert.match(html, /<h2 id="story-heading">Some things stay in your head longer than they should\.<\/h2>/);
  const figure = html.match(/<figure class="story-campaign">([\s\S]*?)<\/figure>/)?.[1];
  assert.ok(figure, 'Campaign photograph exists in initial HTML');
  assert.match(figure, /width="1200" height="1561"/);
  assert.match(figure, /alt="Black-and-white photograph of two people playing with a football on a city-street crosswalk\."/);
  assert.match(figure, /srcSet=/);
  assert.doesNotMatch(figure, /<(?:figcaption|p|h[1-6]|a|button)\b/);
});

test('links stay within the single-page scope or use the approved Veriq credit', () => {
  assert.match(html, /<a href="https:\/\/veriqdigital\.com">Website by Veriq<\/a>/);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  const links = [...html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map(m => m[1]);
  assert.ok(links.length > 0);
  for (const href of links) {
    assert.ok(href === '/home' || /^#[\w-]+$/.test(href) || href === 'https://veriqdigital.com', `Unexpected destination: ${href}`);
    if (href.includes('#')) assert.ok(ids.has(href.split('#')[1]), `Missing anchor: ${href}`);
  }
});

test('official sizes and all twelve inch measurements are rendered in the informational disclosure', () => {
  assert.match(html, /Available sizes: <!-- -->S \/ M \/ L/);
  const guide = html.match(/<details class="size-guide">([\s\S]*?)<\/details>/)?.[1];
  assert.ok(guide);
  assert.match(guide, /<summary>Size guide /);
  assert.match(guide, /Garment measurements \(<!-- -->inches<!-- -->\)/);
  const rows = [...guide.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(([, row]) => [...row.matchAll(/<(?:th|td)[^>]*>(.*?)<\/(?:th|td)>/g)].map(([, value]) => value));
  assert.deepEqual(rows, [
    ['Measurement', 'S', 'M', 'L'],
    ['Shoulder width', '19.25', '20.50', '21.50'],
    ['Chest width (flat)', '21.00', '22.50', '24.00'],
    ['Sleeve length', '13.50', '15.00', '15.00'],
    ['Garment length', '27.50', '28.75', '29.50'],
  ]);
  assert.match(guide, /Chest width is measured flat across the garment, not body circumference\./);
  assert.match(guide, /scope="col"/);
  assert.match(guide, /scope="row"/);
});

test('client initial quantities total 120 and are never represented as live inventory', () => {
  assert.deepEqual(piece.sizes, [
    { label: 'S', initialQuantity: 20 },
    { label: 'M', initialQuantity: 50 },
    { label: 'L', initialQuantity: 50 },
  ]);
  assert.equal(initialInventoryTotal, 120);
  assert.doesNotMatch(html, /initialQuantity|initialInventoryTotal|20 remaining|50 remaining|120 units|in stock|stock reservation/i);
});

test('preview is non-indexable and has no transaction or signup controls', () => {
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(html, /<form\b|<input\b|rel="canonical"|application\/ld\+json|\[CONFIRM\]|\/contact|\/about|checkout|add to cart|buy now/i);
  assert.ok(html.includes('<title>ENCARA | Film / Fashion / Footy</title>'));
  assert.match(readFileSync(new URL('../.next/server/app/robots.txt.body', import.meta.url), 'utf8'), /Disallow: \/\s*$/);
  assert.doesNotMatch(readFileSync(new URL('../.next/server/app/sitemap.xml.body', import.meta.url), 'utf8'), /<url>/);
});

test('every displayed photograph is included as a valid runtime JPEG', () => {
  for (const file of [
    'encara-studio-hand-behind-head.jpg',
    'encara-studio-front.jpg',
    'encara-studio-looking-left.jpg',
    'encara-city-football.jpg',
  ]) {
    const image = readFileSync(new URL(`../public/images/encara/${file}`, import.meta.url));
    assert.equal(image.readUInt16BE(0), 0xffd8, `${file}: JPEG signature`);
    assert.ok(image.length > 1000, `${file}: image is not empty`);
    assert.ok(html.includes(file.replace('.jpg', '.')), `${file}: present in production HTML`);
  }
});

test('shared background has a server-rendered poster and only prepared media is public', () => {
  const hero = html.slice(html.indexOf('<section class="campaign"'), html.indexOf('id="piece"'));
  assert.match(hero, /encara-studio-hand-behind-head\.[\w]+\.jpg/);
  assert.match(html, /class="cinematic-background"/);
  assert.match(html, /<img[^>]+src="\/videos\/encara\/encara-pier-poster.jpg"/);
  assert.match(hero, /campaign-reduced-still/);
  // Motion is opt-in after the browser preference check; SSR/no-JS stays static.
  assert.doesNotMatch(html, /<video\b/);
  const mediaDir = new URL('../public/videos/encara/', import.meta.url);
  assert.deepEqual(readdirSync(mediaDir).sort(), ['encara-pier-monochrome.mp4', 'encara-pier-poster.jpg']);
  assert.ok(readdirSync(new URL('../public/images/encara/', import.meta.url)).every(file => file.endsWith('.jpg')));
  const film = readFileSync(new URL('encara-pier-monochrome.mp4', mediaDir));
  const boxes = [];
  for (let offset = 0; offset < film.length;) {
    const length = film.readUInt32BE(offset);
    assert.ok(length >= 8 && offset + length <= film.length, 'Valid MP4 box');
    boxes.push(film.toString('ascii', offset + 4, offset + 8));
    offset += length;
  }
  assert.ok(boxes.indexOf('moov') < boxes.indexOf('mdat'), 'Fast-start metadata precedes footage');
  assert.ok(film.includes(Buffer.from('avc1')), 'Browser-compatible H.264');
  assert.ok(film.includes(Buffer.from('vide')));
  assert.ok(!film.includes(Buffer.from('soun')), 'No source soundtrack shipped');
  assert.ok(film.length < 2_000_000, 'Prepared four-second film transfer budget');
});
