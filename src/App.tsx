import { useEffect, useRef, useState } from "react";
import ArcGISMap from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import esriConfig from "@arcgis/core/config";
import { layerDefinitions, layerUrl, type LayerId } from "./layers";

type Visibility = Record<LayerId, boolean>;
type LoadState = "loading" | "ready" | "error";

const initialVisibility = Object.fromEntries(
  layerDefinitions.map((layer) => [layer.id, layer.visible]),
) as Visibility;

const apiKey = import.meta.env.VITE_ARCGIS_API_KEY?.trim();
const useEsriBasemap = Boolean(apiKey) && (
  import.meta.env.DEV || window.location.hostname === "arcgisdemo.apiariavera.com"
);

function buildLayer(id: LayerId): FeatureLayer {
  const definition = layerDefinitions.find((entry) => entry.id === id)!;
  const common = {
    url: layerUrl(definition.serviceId),
    title: definition.name,
    visible: definition.visible,
    outFields: [...definition.fields],
    copyright: "Norfolk GIS",
  };

  if (id === "trees") {
    return new FeatureLayer({
      ...common,
      minScale: 30000,
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-marker",
          style: "circle",
          color: definition.color,
          size: 5,
          outline: { color: "#ffffff", width: 1 },
        },
      },
      popupTemplate: {
        title: "{SPECIES}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              { fieldName: "VIGOUR", label: "Vigour" },
              { fieldName: "DBH_1", label: "Diameter at breast height" },
              { fieldName: "DATE_INSPECTED", label: "Last inspected", format: { dateFormat: "short-date" } },
            ],
          },
        ],
      },
    });
  }

  return new FeatureLayer({
    ...common,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: id === "parks" ? [217, 157, 66, 0.35] : [70, 122, 89, 0.32],
        outline: { color: definition.color, width: 1.4 },
      },
    },
    popupTemplate:
      id === "parks"
        ? {
            title: "{Name}",
            content: [{ type: "fields", fieldInfos: [
              { fieldName: "Address", label: "Address" },
              { fieldName: "Class", label: "Park class" },
            ] }],
          }
        : {
            title: "{NAME}",
            content: [{ type: "fields", fieldInfos: [
              { fieldName: "ACREAGE", label: "Area (acres)", format: { digitSeparator: true, places: 1 } },
              { fieldName: "STATUS", label: "Status" },
            ] }],
          },
  });
}

export default function App() {
  const mapElement = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const layersRef = useRef<Record<LayerId, FeatureLayer> | null>(null);
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [message, setMessage] = useState("Connecting to Norfolk County map services…");

  useEffect(() => {
    if (!mapElement.current) return;
    if (useEsriBasemap && apiKey) esriConfig.apiKeys.basemapStyles = apiKey;

    const layers = Object.fromEntries(
      layerDefinitions.map(({ id }) => [id, buildLayer(id)]),
    ) as Record<LayerId, FeatureLayer>;
    layersRef.current = layers;

    const map = new ArcGISMap({
      basemap: useEsriBasemap ? "arcgis/topographic" : "osm",
      layers: [layers.woodlots, layers.parks, layers.trees],
    });
    const view = new MapView({
      container: mapElement.current,
      map,
      center: [-80.46, 42.84],
      zoom: 10,
      popupEnabled: true,
      ui: { components: ["zoom"] },
    });
    viewRef.current = view;

    Promise.all([view.when(), layers.parks.load(), layers.woodlots.load(), layers.trees.load()])
      .then(() => {
        if (view.destroyed) return;
        setLoadState("ready");
        setMessage("Live county layers loaded. Select a feature to inspect it.");
      })
      .catch((error: unknown) => {
        if (view.destroyed) return;
        console.error("Map layer load failed", error);
        setLoadState("error");
        setMessage("A live map service could not be loaded. Try refreshing; the county service may be unavailable.");
      });

    return () => {
      layersRef.current = null;
      viewRef.current = null;
      view.destroy();
    };
  }, []);

  function toggleLayer(id: LayerId) {
    const next = !visibility[id];
    setVisibility((current) => ({ ...current, [id]: next }));
    if (layersRef.current) layersRef.current[id].visible = next;
    if (id === "trees" && next && viewRef.current && viewRef.current.scale > 30000) {
      void viewRef.current.goTo({ center: [-80.31, 42.84], zoom: 14 });
      setMessage("Zoomed toward Simcoe so individual tree records can appear.");
    }
  }

  function resetExtent() {
    if (viewRef.current) void viewRef.current.goTo({ center: [-80.46, 42.84], zoom: 10 });
  }

  return (
    <div className="app-shell">
      <header className="masthead">
        <div className="brand-mark" aria-hidden="true"><span>✳</span></div>
        <div className="brand-copy">
          <div className="eyebrow">Independent GIS portfolio project</div>
          <h1>Norfolk Field Atlas</h1>
        </div>
        <div className="header-meta">Parks <span>·</span> Woodlots <span>·</span> Urban trees</div>
      </header>

      <div className="workspace">
        <aside className="sidebar" aria-label="Map layers and information">
          <div className="sidebar-intro">
            <div className="section-kicker">Explore the landscape</div>
            <h2>Public spaces,<br />{" "}in context.</h2>
            <p>Explore Norfolk County’s public GIS layers directly. Turn layers on or off, then select a feature for details.</p>
          </div>

          <div className="section-heading"><span>Map layers</span><span className="small-label">LIVE DATA</span></div>
          <div className="layer-list">
            {layerDefinitions.map((layer) => (
              <button
                className={`layer-option ${visibility[layer.id] ? "is-active" : ""}`}
                type="button"
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                aria-pressed={visibility[layer.id]}
              >
                <span className="layer-swatch" style={{ backgroundColor: layer.color }} aria-hidden="true" />
                <span className="layer-text"><strong>{layer.name}</strong><small>{layer.description}</small></span>
                <span className="toggle-track" aria-hidden="true"><span /></span>
              </button>
            ))}
          </div>

          <div className="map-note">
            <strong>About this map</strong>
            <p>County data is served live from Norfolk GIS. Tree points appear at closer zoom levels to keep the county view readable.</p>
          </div>
          <div className="sidebar-bottom">
            <a href="https://www.norfolkcounty.ca/home-property-and-neighbourhood/maps-and-data/open-data/" target="_blank" rel="noreferrer">Norfolk Open Data ↗</a>
            <a href="https://github.com/Julian-Nicholls/arcgis-demo" target="_blank" rel="noreferrer">Project source ↗</a>
          </div>
        </aside>

        <main className="map-panel" aria-label="Interactive map of Norfolk County">
          <div className="map-toolbar">
            <span className="map-label"><span className="status-dot" /> Norfolk County, Ontario</span>
            <button type="button" onClick={resetExtent}>Reset view <span aria-hidden="true">↗</span></button>
          </div>
          <div ref={mapElement} className="map-view" />
          <div className={`map-status ${loadState}`} role="status">{message}</div>
          <div className="source-credit">Map data © Norfolk GIS · {useEsriBasemap ? "Esri basemap" : "OpenStreetMap basemap"}</div>
        </main>
      </div>
      <footer className="site-footer">A public-data exploration by Julian Nicholls <span>·</span> Unaffiliated with Norfolk County <span>·</span> For demonstration, not operational decisions</footer>
    </div>
  );
}
