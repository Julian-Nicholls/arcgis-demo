import test from "node:test";
import assert from "node:assert/strict";
import { checkLayer, expectedLayers, ORIGIN } from "../scripts/service-check.mjs";

const woodlots = expectedLayers[1];

function fakeFetch({ cors = ORIGIN, fields = woodlots.fields, count = 34, capabilities = "Map,Query,Data" } = {}) {
  return async (url, options) => {
    assert.equal(options.headers.Origin, ORIGIN);
    const payload = url.includes("/query?")
      ? { count }
      : { name: woodlots.name, geometryType: woodlots.geometryType, capabilities, fields: fields.map((name) => ({ name })) };
    return new Response(JSON.stringify(payload), { headers: { "access-control-allow-origin": cors } });
  };
}

test("accepts a queryable layer with the fields the app actually displays", async () => {
  assert.deepEqual(await checkLayer(woodlots, fakeFetch()), { id: 13, name: "County Woodlots", count: 34 });
});

test("rejects a schema change before it silently breaks a popup", async () => {
  await assert.rejects(checkLayer(woodlots, fakeFetch({ fields: ["NAME", "STATUS"] })), /missing field ACREAGE/);
});

test("rejects a service that will not allow the deployment origin", async () => {
  await assert.rejects(checkLayer(woodlots, fakeFetch({ cors: "*" })), /CORS origin not allowed/);
});

test("rejects a non-queryable service", async () => {
  await assert.rejects(checkLayer(woodlots, fakeFetch({ capabilities: "Map" })), /query unavailable/);
});

