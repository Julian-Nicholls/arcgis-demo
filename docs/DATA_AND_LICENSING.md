# Source verification and reuse notes

Checked November 8, 2026. These URLs are the live county sources, not copied datasets.

| Layer | Source | Geometry | Displayed fields | Live count at check |
| --- | --- | --- | --- | ---: |
| County parks | [MapServer/6](https://gis2.norfolkcounty.ca/arcgis/rest/services/Services_Public_GISviewer/Parks_Recreation/MapServer/6) | Polygon | Name, Address, Class | 97 |
| County woodlots | [MapServer/13](https://gis2.norfolkcounty.ca/arcgis/rest/services/Services_Public_GISviewer/Parks_Recreation/MapServer/13) | Polygon | NAME, ACREAGE, STATUS | 36 |
| Tree inventory | [MapServer/14](https://gis2.norfolkcounty.ca/arcgis/rest/services/Services_Public_GISviewer/Parks_Recreation/MapServer/14) | Point | SPECIES, VIGOUR, DBH_1, DATE_INSPECTED | 41,416 |

All three layers answered metadata and count queries, advertise `Query`, and returned `Access-Control-Allow-Origin: https://arcgisdemo.apiariavera.com` when requested with that origin. Recheck with `npm run data:check` after deployment. CORS is service behavior, so it can change. The tree service has more fields than this portfolio needs, including work-related notes; the app requests and displays only the four fields listed above. It makes no editing calls.

The [service directory](https://gis2.norfolkcounty.ca/arcgis/rest/services/Services_Public_GISviewer/Parks_Recreation/MapServer) says `Copyright Text: Norfolk GIS`. The [county Open Data page](https://www.norfolkcounty.ca/home-property-and-neighbourhood/maps-and-data/open-data/) links a portal and says GIS data can be downloaded at no cost. That does **not** establish an explicit license for republishing these particular REST layers. This app uses direct live links, attributes Norfolk GIS, and does not redistribute a bulk copy. Confirm any additional reuse conditions with Norfolk GIS before a public campaign or adding downloadable data.

Esri's [licensing and attribution guidance](https://location.arcgis.com/help/licensing-and-attribution/) requires attribution for Esri basemaps and services. The app retains SDK attribution and gives Norfolk GIS source credit. For no-payment-method operation, see Esri's [billing guidance](https://location.arcgis.com/help/billing/): free tier access remains available; pay-as-you-go requires a payment method. This is an access limit, not a guarantee of uninterrupted service.

