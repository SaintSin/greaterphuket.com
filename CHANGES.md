# Changes

## 2026-06-26

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
