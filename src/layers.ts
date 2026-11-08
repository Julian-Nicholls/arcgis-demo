export const SERVICE_ROOT =
  "https://gis2.norfolkcounty.ca/arcgis/rest/services/Services_Public_GISviewer/Parks_Recreation/MapServer";

export const layerDefinitions = [
  {
    id: "parks",
    name: "County parks",
    description: "Public parks maintained by Norfolk County",
    serviceId: 6,
    color: "#d99d42",
    visible: true,
    fields: ["Name", "Address", "Class"],
  },
  {
    id: "woodlots",
    name: "County woodlots",
    description: "County forest properties and conservation spaces",
    serviceId: 13,
    color: "#467a59",
    visible: true,
    fields: ["NAME", "ACREAGE", "STATUS"],
  },
  {
    id: "trees",
    name: "Tree inventory",
    description: "Inventoried trees; turn on to explore at street scale",
    serviceId: 14,
    color: "#2b776f",
    visible: false,
    fields: ["SPECIES", "VIGOUR", "DBH_1", "DATE_INSPECTED"],
  },
] as const;

export type LayerId = (typeof layerDefinitions)[number]["id"];

export function layerUrl(serviceId: number): string {
  return `${SERVICE_ROOT}/${serviceId}`;
}

