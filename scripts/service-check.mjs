export const ORIGIN = "https://arcgisdemo.apiariavera.com";

export const expectedLayers = [
  { id: 6, name: "Parks - County", geometryType: "esriGeometryPolygon", fields: ["Name", "Address", "Class"] },
  { id: 13, name: "County Woodlots", geometryType: "esriGeometryPolygon", fields: ["NAME", "ACREAGE", "STATUS"] },
  { id: 14, name: "Tree Inventory", geometryType: "esriGeometryPoint", fields: ["SPECIES", "VIGOUR", "DBH_1", "DATE_INSPECTED"] },
];

export const SERVICE_ROOT =
  "https://gis2.norfolkcounty.ca/arcgis/rest/services/Services_Public_GISviewer/Parks_Recreation/MapServer";

async function getJson(url, fetchImpl) {
  const response = await fetchImpl(url, { headers: { Origin: ORIGIN } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  if (response.headers.get("access-control-allow-origin") !== ORIGIN) {
    throw new Error(`CORS origin not allowed for ${url}`);
  }
  const data = await response.json();
  if (data.error) throw new Error(`ArcGIS error ${data.error.code}: ${data.error.message}`);
  return data;
}

export async function checkLayer(expected, fetchImpl = fetch) {
  const root = `${SERVICE_ROOT}/${expected.id}`;
  const metadata = await getJson(`${root}?f=pjson`, fetchImpl);
  if (metadata.name !== expected.name) throw new Error(`Layer ${expected.id}: unexpected name ${metadata.name}`);
  if (metadata.geometryType !== expected.geometryType) throw new Error(`Layer ${expected.id}: unexpected geometry`);
  if (!metadata.capabilities?.split(",").includes("Query")) throw new Error(`Layer ${expected.id}: query unavailable`);
  const availableFields = new Set(metadata.fields?.map(({ name }) => name));
  for (const field of expected.fields) {
    if (!availableFields.has(field)) throw new Error(`Layer ${expected.id}: missing field ${field}`);
  }

  const params = new URLSearchParams({ f: "json", where: "1=1", returnCountOnly: "true" });
  const count = await getJson(`${root}/query?${params}`, fetchImpl);
  if (!Number.isInteger(count.count) || count.count < 1) throw new Error(`Layer ${expected.id}: invalid feature count`);
  return { id: expected.id, name: expected.name, count: count.count };
}

