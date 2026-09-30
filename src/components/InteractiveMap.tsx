"use client";

/**
 * InteractiveMap — Leaflet map rendered on CRS.Simple with schematic
 * coordinates 0–100 mapped from location x/y.
 *
 * IMPORTANT: the background is an original abstract schematic (grid +
 * vignette + decorative contours) drawn in code. It is NOT official Garena
 * map art and is labeled as such everywhere it appears.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapWithLocations } from "@/data/demo";

const BOUNDS = L.latLngBounds(L.latLng(0, 0), L.latLng(100, 100));

const LOCATION_TYPES = [
  { key: "hot_drop", label: "Hot drop", color: "#ef4444" },
  { key: "town", label: "Town", color: "#f59e0b" },
  { key: "compound", label: "Compound", color: "#60a5fa" },
  { key: "landmark", label: "Landmark", color: "#a78bfa" },
];

const LOOT_TIERS = [
  { key: "high", label: "High tier", color: "#ffd166" },
  { key: "medium", label: "Medium tier", color: "#9cc5ff" },
  { key: "low", label: "Low tier", color: "#8b93a7" },
];

function typeMeta(type: string) {
  return (
    LOCATION_TYPES.find((t) => t.key === type) ?? {
      key: type,
      label: type.replace(/_/g, " "),
      color: "#a1a1aa",
    }
  );
}

function tierMeta(tier: string) {
  return (
    LOOT_TIERS.find((t) => t.key === tier) ?? {
      key: tier,
      label: tier,
      color: "#a1a1aa",
    }
  );
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Original abstract schematic background (grid + vignette + decor contours). */
function schematicUri(): string {
  const lines: string[] = [];
  for (let i = 0; i <= 100; i += 10) {
    const major = i % 50 === 0;
    const w = major ? 0.5 : 0.22;
    const o = major ? 0.85 : 0.55;
    lines.push(
      `<line x1="${i}" y1="0" x2="${i}" y2="100" stroke="#223041" stroke-width="${w}" opacity="${o}"/>`,
      `<line x1="0" y1="${i}" x2="100" y2="${i}" stroke="#223041" stroke-width="${w}" opacity="${o}"/>`
    );
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<defs><radialGradient id="vig" cx="50%" cy="50%" r="75%">` +
    `<stop offset="55%" stop-color="#000000" stop-opacity="0"/>` +
    `<stop offset="100%" stop-color="#000000" stop-opacity="0.6"/>` +
    `</radialGradient></defs>` +
    `<rect width="100" height="100" fill="#0b0e14"/>` +
    `<ellipse cx="30" cy="38" rx="22" ry="14" fill="none" stroke="#2a3448" stroke-width="0.6" opacity="0.7"/>` +
    `<ellipse cx="30" cy="38" rx="14" ry="8" fill="none" stroke="#2a3448" stroke-width="0.4" opacity="0.5"/>` +
    `<ellipse cx="72" cy="66" rx="16" ry="20" fill="none" stroke="#2a3448" stroke-width="0.6" opacity="0.7"/>` +
    `<ellipse cx="72" cy="66" rx="9" ry="12" fill="none" stroke="#2a3448" stroke-width="0.4" opacity="0.5"/>` +
    `<path d="M8 78 Q 30 70 48 76 T 92 70" fill="none" stroke="#2a3448" stroke-width="0.5" opacity="0.6"/>` +
    lines.join("") +
    `<rect width="100" height="100" fill="url(#vig)"/>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

type Loc = MapWithLocations["locations"][number];

function popupHtml(loc: Loc): string {
  const meta = typeMeta(loc.type);
  const loot =
    loc.loot.length > 0
      ? `<div class="ff-loot-list">${loc.loot
          .map((l) => {
            const t = tierMeta(l.tier);
            return (
              `<div class="ff-loot">` +
              `<span class="ff-chip" style="--c:${t.color}">${esc(t.label)}</span>` +
              `<span><b>${esc(l.category)}</b>${l.details ? ` — ${esc(l.details)}` : ""}</span>` +
              `</div>`
            );
          })
          .join("")}</div>`
      : `<p class="ff-none">No loot data recorded for this location.</p>`;
  return (
    `<div class="ff-popup">` +
    `<div class="ff-type" style="--c:${meta.color}">${esc(meta.label)}</div>` +
    `<div class="ff-name">${esc(loc.name)}</div>` +
    (loc.description ? `<p class="ff-desc">${esc(loc.description)}</p>` : "") +
    loot +
    `</div>`
  );
}

const MARKER_CSS = `
.ff-marker{position:relative;width:26px;height:26px}
.ff-marker i{position:absolute;inset:7px;border-radius:9999px;background:var(--c);border:2px solid rgba(255,255,255,.9);box-shadow:0 0 12px var(--c)}
.ff-marker::after{content:"";position:absolute;inset:1px;border-radius:9999px;border:2px solid var(--c);opacity:.45}
.ff-popup{font-family:inherit;min-width:180px}
.ff-popup .ff-type{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--c);border:1px solid var(--c);border-radius:9999px;padding:1px 8px;margin-bottom:6px}
.ff-popup .ff-name{font-size:15px;font-weight:700;color:#f4f4f5}
.ff-popup .ff-desc{font-size:12px;color:#a1a1aa;margin:6px 0 0;line-height:1.45}
.ff-popup .ff-loot-list{margin-top:8px;display:flex;flex-direction:column;gap:6px}
.ff-popup .ff-loot{display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#d4d4d8;line-height:1.4}
.ff-popup .ff-loot b{text-transform:capitalize;color:#f4f4f5}
.ff-popup .ff-chip{flex:none;font-size:10px;font-weight:700;color:var(--c);border:1px solid var(--c);border-radius:9999px;padding:0 7px;margin-top:1px;white-space:nowrap}
.ff-popup .ff-none{font-size:12px;color:#71717a;margin:8px 0 0;font-style:italic}
.leaflet-popup-content{margin:12px 14px;line-height:1.4}
`;

export default function InteractiveMap({ map }: { map: MapWithLocations }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markerIndex = useRef(new Map<string, L.Marker>());

  const [query, setQuery] = useState("");
  const [layersOpen, setLayersOpen] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState<string[]>(() =>
    LOCATION_TYPES.map((t) => t.key)
  );
  const [enabledTiers, setEnabledTiers] = useState<string[]>(() =>
    LOOT_TIERS.map((t) => t.key)
  );

  // Init map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const m = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 5,
      zoomSnap: 0.25,
      zoomControl: false,
      maxBounds: BOUNDS.pad(0.3),
      maxBoundsViscosity: 1,
    });
    L.control.zoom({ position: "bottomright" }).addTo(m);
    m.attributionControl.setPrefix(false);
    m.attributionControl.addAttribution(
      "Schematic illustration · Independent fan project, not affiliated with Garena"
    );
    L.imageOverlay(schematicUri(), BOUNDS).addTo(m);
    layerRef.current = L.layerGroup().addTo(m);
    m.fitBounds(BOUNDS, { padding: [16, 16] });
    mapRef.current = m;
    return () => {
      m.remove();
      mapRef.current = null;
      layerRef.current = null;
      markerIndex.current.clear();
    };
  }, []);

  // Rebuild markers when filters change.
  useEffect(() => {
    const m = mapRef.current;
    const layer = layerRef.current;
    if (!m || !layer) return;
    layer.clearLayers();
    markerIndex.current.clear();
    const visible = map.locations.filter(
      (loc) =>
        enabledTypes.includes(loc.type) &&
        (loc.loot.length === 0 ||
          loc.loot.some((l) => enabledTiers.includes(l.tier)))
    );
    for (const loc of visible) {
      const meta = typeMeta(loc.type);
      const icon = L.divIcon({
        className: "",
        html: `<div class="ff-marker" style="--c:${meta.color}"><i></i></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -14],
      });
      const marker = L.marker([loc.y, loc.x], { icon, title: loc.name });
      marker.bindPopup(popupHtml(loc), { maxWidth: 280 });
      marker.addTo(layer);
      markerIndex.current.set(loc.id, marker);
    }
  }, [map, enabledTypes, enabledTiers]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return map.locations
      .filter((l) => l.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, map]);

  function focusLocation(id: string) {
    const loc = map.locations.find((l) => l.id === id);
    if (!loc) return;
    // Auto-enable the layers needed to reveal this location.
    if (!enabledTypes.includes(loc.type))
      setEnabledTypes((t) => [...t, loc.type]);
    if (
      loc.loot.length > 0 &&
      !loc.loot.some((l) => enabledTiers.includes(l.tier))
    )
      setEnabledTiers((t) => [...t, ...loc.loot.map((l) => l.tier)]);
    setQuery("");
    window.setTimeout(() => {
      const m = mapRef.current;
      const marker = markerIndex.current.get(id);
      if (!m || !marker) return;
      m.flyTo(marker.getLatLng(), Math.max(m.getZoom(), 1.5), {
        duration: 0.7,
      });
      window.setTimeout(() => marker.openPopup(), 750);
    }, 140);
  }

  function toggleType(key: string) {
    setEnabledTypes((t) =>
      t.includes(key) ? t.filter((k) => k !== key) : [...t, key]
    );
  }

  function toggleTier(key: string) {
    setEnabledTiers((t) =>
      t.includes(key) ? t.filter((k) => k !== key) : [...t, key]
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl ring-1 ring-arena-700/60">
      <style>{MARKER_CSS}</style>
      <div ref={containerRef} className="h-[62vh] min-h-[420px] w-full" />

      {/* Search */}
      <div className="absolute left-3 top-3 z-[1000] w-[calc(100%-6.5rem)] sm:w-72">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0)
              focusLocation(results[0].id);
          }}
          placeholder="Search locations…"
          aria-label="Search map locations"
          className="w-full rounded-lg border border-arena-600 bg-arena-900/95 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-lg backdrop-blur focus:border-accent-500 focus:outline-none"
        />
        {results.length > 0 && (
          <ul className="mt-1 overflow-hidden rounded-lg border border-arena-600 bg-arena-900/95 shadow-xl backdrop-blur">
            {results.map((l) => {
              const meta = typeMeta(l.type);
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => focusLocation(l.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-200 hover:bg-arena-800"
                  >
                    <span
                      className="h-2.5 w-2.5 flex-none rounded-full"
                      style={{ background: meta.color }}
                    />
                    <span className="truncate">{l.name}</span>
                    <span className="ml-auto flex-none text-xs text-zinc-500">
                      {meta.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Layer toggles */}
      <div className="absolute right-3 top-3 z-[1000]">
        <button
          type="button"
          onClick={() => setLayersOpen((o) => !o)}
          aria-expanded={layersOpen}
          className="flex items-center gap-2 rounded-lg border border-arena-600 bg-arena-900/95 px-3 py-2 text-sm font-semibold text-zinc-200 shadow-lg backdrop-blur hover:bg-arena-800"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2 2 7l10 5 10-5-10-5Z" />
            <path d="m2 12 10 5 10-5" />
            <path d="m2 17 10 5 10-5" />
          </svg>
          Layers
        </button>
        {layersOpen && (
          <div className="mt-1 w-60 rounded-lg border border-arena-600 bg-arena-900/95 p-3 shadow-xl backdrop-blur">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Location types
            </p>
            <div className="space-y-1.5">
              {LOCATION_TYPES.map((t) => (
                <label
                  key={t.key}
                  className="flex cursor-pointer items-center gap-2 text-sm text-zinc-200"
                >
                  <input
                    type="checkbox"
                    checked={enabledTypes.includes(t.key)}
                    onChange={() => toggleType(t.key)}
                    className="h-4 w-4 accent-amber-500"
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: t.color }}
                  />
                  {t.label}
                </label>
              ))}
            </div>
            <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Loot tiers
            </p>
            <div className="space-y-1.5">
              {LOOT_TIERS.map((t) => (
                <label
                  key={t.key}
                  className="flex cursor-pointer items-center gap-2 text-sm text-zinc-200"
                >
                  <input
                    type="checkbox"
                    checked={enabledTiers.includes(t.key)}
                    onChange={() => toggleTier(t.key)}
                    className="h-4 w-4 accent-amber-500"
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: t.color }}
                  />
                  {t.label}
                </label>
              ))}
            </div>
            <p className="mt-3 border-t border-arena-700/60 pt-2 text-[11px] leading-relaxed text-zinc-500">
              Unchecking a loot tier hides locations whose loot is only in
              that tier.
            </p>
          </div>
        )}
      </div>

      {/* Legend + schematic notice */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg border border-arena-600 bg-arena-900/90 px-3 py-2 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {LOCATION_TYPES.map((t) => (
            <span
              key={t.key}
              className="flex items-center gap-1.5 text-[11px] text-zinc-400"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: t.color }}
              />
              {t.label}
            </span>
          ))}
        </div>
        <p className="mt-1.5 border-t border-arena-700/60 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Schematic — not official map art
        </p>
      </div>
    </div>
  );
}
