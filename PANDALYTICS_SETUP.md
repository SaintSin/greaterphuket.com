# Pandalytics Analytics Setup

## Summary

Integrated analytics system from pandalytics-2 to track Core Web Vitals and pageviews in Netlify Functions.

## Changes Made

### 1. Added Netlify Function: `netlify/functions/pandalytics.ts`

Server-side function that receives analytics data from the client and stores it in Turso database.

**Key functionality:**

- Accepts POST requests with metric data
- Performs browser detection from user agent
- Inserts session and pageview data into Turso
- Requires `PANDALYTICS_TURSO_REST_ENDPOINT` and `PANDALYTICS_TURSO_API_TOKEN` in `.env`

**Database tables created:**

- `sessions` - tracks unique browser sessions
- `pageviews` - tracks individual page visits with Core Web Vitals

### 2. Added Analytics Component: `src/components/page/Analytics.astro`

Client-side component that tracks user behavior and Core Web Vitals.

**Original issue and fix:**

The component uses `define:vars` to inject variables from Astro's build context, but Astro 6 doesn't process `define:vars` on inline scripts.

**Before (broken):**

```astro
---
const siteId = Astro.site ? new URL(Astro.site).hostname : 'localhost';
---

<script define:vars={{ siteId }} is:inline>
  (function () {
    const metrics = {
      site_id: siteId,  // ❌ siteId undefined - define:vars didn't inject
      ...
    };
  })();
</script>
```

**After (working):**

```astro
---
// Remove build-time siteId extraction - use browser API instead
---

<script is:inline>
  (function () {
    const metrics = {
      site_id: location.hostname,  // ✅ Gets hostname directly from browser
      ...
    };
  })();
</script>
```

**What the script tracks:**

- Session ID (stored in sessionStorage, unique per browser session)
- Page URL and path
- Core Web Vitals:
  - LCP (Largest Contentful Paint) - page load performance
  - FCP (First Contentful Paint) - visual stability
  - CLS (Cumulative Layout Shift) - responsiveness
  - INP (Interaction to Next Paint) - input responsiveness
  - TTFB (Time to First Byte) - server response time
- Browser type and version
- Screen dimensions
- User agent

**Deduplication:** Uses per-page 60-second cooldown to prevent duplicate tracking of the same page within a minute.

### 3. Updated `.env` API Token

The initial token was **read-only** and couldn't write to the database.

**Before (read-only):**

```
PANDALYTICS_TURSO_API_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicm8iLCJpYXQiOjE3NjMxMjY5MTYsImlkIjoiMzNkMmQzMzktMTNhNC00NzI1LWE1MTAtMmRiNTBiZGYzOGNiIiwicmlkIjoiYjI2OTU5YjQtMGI2My00YzNlLTljZTctMjRjZGJiZWJjY2Y2In0.Fb32_...
```

**After (write-enabled):**

```
PANDALYTICS_TURSO_API_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjMyMDc2NzIsImlkIjoiMzNkMmQzMzktMTNhNC00NzI1LWE1MTAtMmRiNTBiZGYzOGNiIiwicmlkIjoiYjI2OTU5YjQtMGI2My00YzNlLTljZTctMjRjZGJiZWJjY2Y2In0.T8bkrvu...
```

Difference: Removed `"a":"ro"` from the JWT payload, allowing INSERT operations.

### 4. Component Already Integrated

`src/layouts/BaseLayout.astro` already had the Analytics component imported and included:

```astro
---
import Analytics from "@components/page/Analytics.astro";
// ... other imports
---

<!doctype html>
<html lang="en">
  <Basehead metaData={metaData} />
  <body>
    <Header />
    <div class="content">
      <slot />
    </div>
    <Footer />
    <Analytics />  <!-- ✅ Already included, runs on all pages -->
  </body>
</html>
```

## How It Works

1. **Page Load:** Analytics component initializes on every page
2. **Tracking:** Collects Core Web Vitals via Performance Observer API
3. **Deduplication:** Checks if this page was tracked in the last 60 seconds
4. **Send:** Uses `navigator.sendBeacon()` (or `fetch` as fallback) to POST data to `/.netlify/functions/pandalytics`
5. **Storage:** Netlify Function receives data and inserts into Turso database via REST API
6. **Logging:** Function logs success with `"Pageview recorded: /path"`

## Monitoring

Check Netlify Function logs in:

- Netlify Dashboard → Functions → pandalytics
- Look for `"Pageview recorded:"` messages when real traffic hits

## Development

Analytics is disabled in development (`localhost` and `127.0.0.1` return early).

To test locally with tracking enabled, temporarily change the hostname check in `Analytics.astro`.
