# First Codex Local continuation ticket

**Title:** Make the Norfolk map easier to explore and verify the deployment preview

**Goal:** Turn the working three-layer map into a reviewable portfolio demo before the November 12 application deadline.

## Scope

1. Add an accessible legend that matches the actual park, woodlot, and tree symbols.
2. Add a small feature-inspection panel that explains a selected feature in plain language and links to the source layer. Show only the fields already allowlisted in `src/layers.ts`.
3. Check the built app at desktop and mobile widths, including layer toggles, tree zoom, feature selection, source credit, and failure state when the county service is unavailable.
4. Verify the restricted Esri basemap on `arcgisdemo.apiariavera.com` and the OpenStreetMap fallback on `arcgis-demo-cqr.pages.dev`. Capture one production screenshot for the application portfolio.

## Acceptance

- All three layers load from Norfolk's live service with no copied data or editing requests.
- The legend and selected-feature details match what appears on the map and remain keyboard usable.
- No work-order notes, inspector details, or other unused tree attributes appear in the interface.
- `npm test`, `npm run data:check`, and `npm run build` pass.
- The site works on phone and desktop; the custom domain shows correct Norfolk GIS and Esri attribution, while the Pages hostname shows Norfolk GIS and OpenStreetMap attribution.
- Document preview URL, checks, and any source-data limitations in the README.

**Out of scope:** ArcGIS Enterprise administration, hosted-feature publication, billing activation, geocoding, spatial analysis, and application submission.
