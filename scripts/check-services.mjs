import { checkLayer, expectedLayers, ORIGIN } from "./service-check.mjs";

console.log(`Checking Norfolk GIS layers and CORS for ${ORIGIN}`);
let failed = false;
for (const layer of expectedLayers) {
  try {
    const result = await checkLayer(layer);
    console.log(`OK  ${result.name}: ${result.count.toLocaleString()} records`);
  } catch (error) {
    failed = true;
    console.error(`FAIL  ${layer.name}: ${error.message}`);
  }
}
if (failed) process.exitCode = 1;

