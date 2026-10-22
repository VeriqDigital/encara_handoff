import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { heading, paragraphs } from './fixtures/manifesto.mjs';

const html = readFileSync(new URL('../.next/server/app/home.html', import.meta.url), 'utf8');

test('manifesto initial HTML preserves the approved copy and four ordered editorial columns', () => {
  const manifesto = html.match(/<div class="manifesto">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(manifesto);
  assert.ok(manifesto.includes(`<h2 id="story-heading">${heading}</h2>`));
  const copy = [...manifesto.matchAll(/<p(?: class="manifesto-welcome")?>(.*?)<\/p>/g)].map(([, text]) => text);
  assert.deepEqual(copy, paragraphs);
  const columns = [...manifesto.matchAll(/<div class="manifesto-(intro|body)">/g)].map(([, type]) => type);
  assert.deepEqual(columns, ['intro', 'body', 'body', 'body']);
  assert.match(manifesto, /<p class="manifesto-welcome">Welcome to ENCARA\.<\/p>/);
});

test('manifesto reveals the shared background without a section player or poster', () => {
  assert.match(html, /<div class="manifesto-panel"><div/);
  assert.doesNotMatch(html, /<video\b|manifesto-media|manifesto-video|manifesto-control/);
});
