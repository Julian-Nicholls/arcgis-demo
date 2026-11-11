# Norfolk Field Atlas

An independent portfolio map of Norfolk County, Ontario. It displays live county parks, woodlots, and inventoried trees using React, TypeScript, Vite, and the ArcGIS Maps SDK for JavaScript. The app makes read-only requests to Norfolk County's public ArcGIS REST service; it does not copy or edit county data.

**Status (November 10, 2026):** Initial vertical slice is live at [arcgisdemo.apiariavera.com](https://arcgisdemo.apiariavera.com). Cloudflare Pages builds from `main`; the production map uses a restricted ArcGIS Location Platform key for Esri basemap styles.

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

The project uses an **independent ArcGIS Location Platform account** owned by the project creator. Its API key credential has only the basemap styles privilege, no item access, and the production referrer `https://arcgisdemo.apiariavera.com`; it expires February 8, 2027. The value is stored as the masked `VITE_ARCGIS_API_KEY` production variable in Cloudflare Pages. Never commit the key. A browser key is visible to visitors by design, so referrer and privilege restrictions matter. Add the exact Pages preview hostname as a separate allowed referrer only if Esri basemap testing there is needed.

With the key present, the custom domain uses Esri's `arcgis/topographic` basemap and keeps the SDK's Esri attribution. The `pages.dev` hostname uses OpenStreetMap because it is outside the key's allowed referrer. Local development also uses OpenStreetMap unless a key is provided and localhost is separately allowed by Esri. The project's free-tier goal depends on staying within Esri's [free allowances](https://developers.arcgis.com/pricing/). Esri says pay-as-you-go is off by default and a payment method is required to enable it; with no payment method, service access stops when a free allowance is exhausted rather than incurring charges. At setup on November 10, pay-as-you-go was disabled and the account showed $0 owed. The code has no paid service calls or hosted Esri data.

## Cloudflare Pages deployment

The `arcgis-demo` Pages project is connected to `Julian-Nicholls/arcgis-demo` on `main`. Its default hostname is [arcgis-demo-cqr.pages.dev](https://arcgis-demo-cqr.pages.dev). Production uses:

| Setting | Value |
| --- | --- |
| Framework preset | React (Vite) |
| Build command | `npm run build` |
| Build output | `dist` |
| Build environment variable | `NODE_VERSION=22` |
| Production secret | `VITE_ARCGIS_API_KEY` (restricted browser key) |

Cloudflare Pages has attached `arcgisdemo.apiariavera.com` and created a proxied CNAME from `arcgisdemo` to `arcgis-demo-cqr.pages.dev`. The custom domain was checked for Esri basemap tiles and attribution, live county layers, tree points at street scale, and a tree popup. The Pages hostname uses OpenStreetMap. No tunnel to the local PC is needed.

To deploy an update, commit and push to `main`, then open **Cloudflare → Workers & Pages → arcgis-demo → Deployments** and wait for a successful production build. Visit the custom domain and check the map. Changes to the Cloudflare secret take effect on the next deployment; use **Retry deployment** on the latest production deployment when changing only that setting. Rotate the Esri key before its expiry and check Esri usage. The app is a single route, so no redirect rule is needed.

## Portfolio scope

The map is an independent demonstration and is unaffiliated with Norfolk County. It does not perform operational analysis or assert that the county's data is complete or current. Before using it for decisions, consult the county's official maps and data. An explicit reuse license for these exact REST layers was not located; attribution and a direct live connection are in place, and the county should be asked to confirm reuse terms before public promotion.
