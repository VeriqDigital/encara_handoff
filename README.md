# ENCARA

Frontend-only landing-page preview for ENCARA, a clothing brand shaped by film, fashion, and footy. A cinematic entrance leads to the campaign homepage, garment information, native size guide, and brand story. The footer includes the intentional “Website by Veriq” attribution.

This source handoff does not include checkout, Shopify, a CMS, customer accounts, real email signup, payment processing, or live inventory. Production domain, hosting, credentials, and environment-specific integrations are not included.

## Requirements and setup

- Node.js 20.9 or newer; an actively supported Node.js LTS release is recommended.
- npm, with registry access for the initial installation. Dependencies are pinned by `package-lock.json`.
- No environment variables, accounts, or external services are required to run the preview.

Run these commands from this directory:

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). On Windows PowerShell with restricted script execution, use `npm.cmd` in place of `npm`.

For validation and a local production preview:

```sh
npm run lint
npm run typecheck
npm run build
npm test
npm start
```

Run the build before `npm test`: the tests inspect generated production HTML in `.next/server/app/`. The type-check script generates Next.js declarations before running TypeScript, so it also works on a fresh installation. `npm start` serves the built application locally; it does not deploy it.

## Stack and scripts

Next.js 16.2.9 (App Router), React 19.2.4, TypeScript 5, Tailwind CSS 4, and ESLint 9. Typography uses system fonts. Images use Next.js image optimization.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the exact locked dependencies |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check TypeScript without emitting JavaScript |
| `npm run build` | Generate the production build |
| `npm test` | Check production HTML, metadata, links, product data, and runtime assets |
| `npm start` | Serve the production build |

## Routes and editing

| Location | Purpose / edit here |
| --- | --- |
| `/` — `app/page.tsx` | Full-screen cinematic entrance linking to `/home` |
| `/home` — `app/home/page.tsx` | Campaign homepage; `#piece` and `#story` anchors |
| `components/sections/` | Hero, garment presentation, story, and closing copy |
| `data/product.ts` | Displayed price, planned-presale wording, sizes, and inch measurements |
| `config/site.ts`, `config/navigation.ts` | Site description and navigation links |
| `components/layout/` | Header, footer, and shared cinematic background |
| `components/entrance/EnterLink.tsx` | Entrance navigation and fade timing |
| `app/globals.css`, `app/entrance.module.css` | Responsive styling, motion, and entrance layout |
| `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts` | Metadata and search discovery settings |

The `$50` price is display copy; its currency code is not configured. S/M/L measurements are informational. Initial quantities in the product data are planning values, never live stock or order reservations.

## Runtime assets and motion

All required media are included in `public/`. Public URLs omit the `public` prefix.

| Directory | Included assets |
| --- | --- |
| `public/images/encara/` | `encara-studio-front.jpg` and `encara-studio-looking-left.jpg` (garment); `encara-city-football.jpg` (story); `encara-studio-hand-behind-head.jpg` (reduced-motion hero) |
| `public/videos/encara/` | `encara-pier-monochrome.mp4` and `encara-pier-poster.jpg` |

The prepared MP4 is a four-second, silent, monochrome H.264 loop at 1600 × 900. One root-layout player stays mounted across entrance navigation and the entire homepage, with a shared pause/play control. ENTER fades for 400 ms, followed by a 450 ms homepage reveal. Reduced motion, disabled JavaScript, and media failures retain static imagery; autoplay denial allows manual retry. Preserve the shared player's lifecycle when changing layouts.

Raw uploads and third-party inspiration material are excluded. The included media are required website assets; confirm permission for public use before launch. The text wordmark is provisional; official identity files and social preview artwork are not included.

The story photograph retains its embedded credit metadata. Confirm the associated usage and redistribution rights; its inclusion is not a licensing clearance.

## Browser checks

`tests/*.browser.mjs` provides optional Playwright checks for responsive layouts, video continuity and fallbacks, keyboard navigation, size-guide interaction, typography, and story content. These are separate from `npm test`. To run them without changing the manifest or lockfile, install Playwright temporarily and use an installed Google Chrome:

```sh
npm install --no-save --package-lock=false playwright
npm start -- --port 3007
```

In another terminal in this directory:

```sh
node --test --test-concurrency=1 tests/*.browser.mjs
```

The default server URL is `http://127.0.0.1:3007`. Optional environment variables: `ENCARA_PREVIEW_URL` changes the server URL; `ENCARA_BROWSER` changes the Playwright browser channel; `PLAYWRIGHT_MODULE` selects an external Playwright package; `ENCARA_QA_DIR` saves local screenshots; `ENCARA_DEV_URL` enables the additional development lifecycle check against a running development server. These variables are only for tests. Running `npm ci` restores the locked dependency set after a temporary Playwright install.

## Before public launch

Search indexing is currently disabled: root metadata sets `noindex, nofollow`, `robots.txt` disallows all crawling, and the sitemap is empty. Review all three settings with the chosen production origin, canonical URLs, and social previews before enabling indexing. These controls do not provide access protection.

Outstanding work includes final copy and media review, official identity assets, public contact/social destinations if needed, selection and configuration of hosting and domain, permission to publish, and browser/device testing including physical Safari/iOS. No production configuration or deployment is supplied by this handoff.

On 2026-10-22, `npm audit --package-lock-only` reported 14 advisories in the delivered dependency set: 1 critical, 12 high, and 1 moderate, including a critical advisory affecting Next.js. Dependency versions and the lockfile are preserved. Review advisories, select compatible updates, and retest before public launch; do not apply forced upgrades without reviewing their effect.

Commerce requires separate implementation and confirmed product details, currency, presale dates, fulfillment, shipping, taxes, returns, support, and merchant/payment setup. Email collection requires a confirmed owner, provider, list/destination, consent wording, and privacy/support details before integration.
