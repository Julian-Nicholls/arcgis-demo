# Norfolk Field Atlas

An independent portfolio map of Norfolk County, Ontario. It displays live county parks, woodlots, and inventoried trees using React, TypeScript, Vite, and the ArcGIS Maps SDK for JavaScript. The app makes read-only requests to Norfolk County's public ArcGIS REST service; it does not copy or edit county data.

**Status (November 8, 2026):** Initial vertical slice built and tested locally. Cloudflare deployment and the owner-managed ArcGIS Location Platform key are still to be configured.

## Run locally

Requires Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. Without an API key, the app uses an OpenStreetMap basemap for development. The county layers still load live. The map shows parks and woodlots by default; turn on the tree inventory to zoom to Simcoe and see tree records at street scale. Select a feature to inspect only the public fields chosen for its popup.

```bash
npm test
npm run data:check
npm run build
```

`data:check` makes live requests to the three county layers. It checks response status, allowed CORS origin, schema fields, query capability, and nonzero feature counts. It needs network access and may fail when the county service is unavailable.

## Data and architecture

```text
Visitor → Cloudflare Pages static React app
                    ├─→ Norfolk County ArcGIS REST (parks, woodlots, trees)
                    └─→ Esri basemap styles (with owner's restricted API key)
Developer → local Node/Vite build → GitHub → Cloudflare Pages
```

No always-on PC, Cloudflare Tunnel, database, or backend is needed for this slice. County service URLs and display-field allowlists are in `src/layers.ts`; the live validator is in `scripts/service-check.mjs`. The county service and Esri basemap are separate providers. This project demonstrates web GIS integration and source evaluation, **not** administration of Norfolk's ArcGIS Enterprise environment.

The selected county service is [Parks_Recreation MapServer](https://gis2.norfolkcounty.ca/arcgis/rest/services/Services_Public_GISviewer/Parks_Recreation/MapServer): layer 6 parks, layer 13 woodlots, layer 14 tree inventory. Source and reuse notes are in [docs/DATA_AND_LICENSING.md](docs/DATA_AND_LICENSING.md).

## ArcGIS Location Platform setup

Use an **independent ArcGIS Location Platform account** owned by the project creator. Create an API key credential with only the basemap styles privilege; allow the production referrer `https://arcgisdemo.apiariavera.com` and a separate preview referrer only if needed. Set a short expiry and monitor usage. The value goes into `VITE_ARCGIS_API_KEY` in local `.env.local` and Cloudflare Pages environment variables. Never commit the key. A browser key is visible to visitors by design, so referrer and privilege restrictions matter.

With the key present, the app switches to Esri's `arcgis/topographic` basemap and keeps the SDK's Esri attribution. Without it, development uses OpenStreetMap. The project's free-tier goal depends on staying within Esri's [free allowances](https://developers.arcgis.com/pricing/). Esri says pay-as-you-go is off by default and a payment method is required to enable it; with no payment method, service access stops when a free allowance is exhausted rather than incurring charges. Check current account terms and usage before public launch. The code has no paid service calls or hosted Esri data.

## Cloudflare Pages deployment

Connect `Julian-Nicholls/arcgis-demo` to a Pages project. Use:

| Setting | Value |
| --- | --- |
| Framework preset | React (Vite) |
| Build command | `npm run build` |
| Build output | `dist` |
| Node version | 22 or newer |
| Environment variable | `VITE_ARCGIS_API_KEY` (restricted browser key) |

Deploy a preview, confirm map tiles, three county layers, popups, attribution, and mobile layout, then add `arcgisdemo.apiariavera.com` in **Pages → Custom domains**. Cloudflare may create the DNS record if it hosts the zone; otherwise add the CNAME it specifies. Associate the domain in Pages before changing DNS. No tunnel to the local PC is needed.

The app is currently a single route, so no redirect rule is needed. This repository has not been connected to a Cloudflare account or published yet.

## Portfolio scope

The map is an independent demonstration and is unaffiliated with Norfolk County. It does not perform operational analysis or assert that the county's data is complete or current. Before using it for decisions, consult the county's official maps and data. An explicit reuse license for these exact REST layers was not located; attribution and a direct live connection are in place, and the county should be asked to confirm reuse terms before public promotion.

