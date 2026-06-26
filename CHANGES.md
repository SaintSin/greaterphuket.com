# Changes

## 2026-06-26

### Currency conversion system

Ported the full client-side currency conversion system from `get-real-ssr-tests`. Prices stored in THB, converted in-browser using rates baked in at build time — no runtime API calls.

**Files added:**

- `scripts/generate-exchange-rates.ts` — fetches live rates from apilayer.net, writes `src/data/exchangeRates.ts`; skips if already run today
- `scripts/debug-logger.ts` — logger utility used by the build script
- `src/data/exchangeRates.ts` — generated rate data (THB→AUD/EUR/GBP/HKD/SGD/USD)
- `src/utils/currencyHelper.ts` — `updateAllPrices()`, `formatCurrency()`, `getSavedCurrency()`, `saveCurrency()`, `dispatchCurrencyChange()`
- `src/utils/geoHelper.ts` — reads Netlify geo country from injected `<meta name="x-country">`
- `src/components/utility/PriceConvert.astro` — currency dropdown with flag icons; auto-detects visitor country via geo, falls back to localStorage, then THB
- `netlify/edge-functions/add-country-header.js` — injects `<meta name="x-country">` on every HTML response using Netlify CDN geo data

**Config changes:**

- `package.json` — added `generate:rates`, `predev`, `prebuild` scripts; added `tsx ^4.19.4` as devDependency
- `tsconfig.json` — added `@data/*` and `@utils/*` path aliases
- `netlify.toml` — added `[[edge_functions]]` config for `add-country-header`
- `.env` — `EXCHANGE_RATES_API_KEY` (also set as a Netlify environment variable for deploys)

**Usage:** place `<PriceConvert />` in the site header. Mark any price element with `class="price"` and `data-thb={rawThbValue}`. Use `class="price price-m"` for millions shorthand (e.g. `฿5.0m`).

Test geo detection locally by appending `?country=GB` to any URL.

---

### Pandabox lightbox gallery

Added Pandabox from the `pandabox-2` experiment — a dependency-free lightbox using Astro content collections and native `<Picture>` for optimised images.

**Files added:**

- `src/components/Pandabox.astro` — production all-in-one component (TS and CSS inlined)
- `src/content.config.ts` — `galleries` content collection definition
- `src/content/galleries/panda.json` — sample gallery (12 images)
- `src/assets/images/pandas/` — sample panda images

**Usage:** import `Pandabox` and point at a gallery JSON by filename (without `.json`):

```astro
---
import Pandabox from '@components/Pandabox.astro';
---
<Pandabox galleryid="panda" transitionType="fade" showThumbnails={true} />
```

Add new galleries by dropping a `.json` file into `src/content/galleries/`. The filename becomes the `galleryid`. See `GUIDE.md` in `pandabox-2` for full props and theming docs.

---

### Animations library

Added [`astro-animations`](https://github.com/SaintSin/astro-animations) (`^0.0.6`) — a lightweight, dependency-free CSS animation integration (<7kB compressed).

**Installed via:** `pnpm add astro-animations`

**Components available:**

- `<Animate>` — wraps elements with CSS animation on entry
- `<ScrollEffect>` — triggers animations as elements scroll into view
- `<astro-animations>` — base integration component

**Usage:**

```astro
---
import { Animate, ScrollEffect } from 'astro-animations';
---
```

---

### Two-column full-bleed layout

Added CSS and JS from the `layout-bleeds` experiment to support full-bleed split-screen sections.

**Files added:**

- `src/styles/two_column.css` — 4-column grid layout with bleed, contained, centered, and overlay variants
- `src/scripts/image-sizes.ts` — JS height-matcher that sizes images to match their paired content block

**Tokens added to `src/styles/_tokens.css`:**

- `--wrapper-padding-inline: 2rem`
- `--wrapper-max-width: var(--max-content-width)`

**Usage:** import `@styles/two_column.css` as a global style (not scoped) and add `<script src="@scripts/image-sizes.ts"></script>` to any page using `.full-width-split-screen`. Astro deduplicates the script automatically. See the experiment's `GUIDE.md` for full HTML structure and variant docs.
