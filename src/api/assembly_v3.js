// src/api/assembly_v3.js
// Standalone v3-lite API client for the YC demo route.
// Independent from src/api/assembly.js (v1) — uses its own env var.

// Resilient to trailing slash on env var (per friend's spec).
const V3_BASE = (
  import.meta.env.VITE_API_V3_URL
  || "https://tier-2-assembly-production.up.railway.app"
).replace(/\/$/, "");

const FORECAST_PATH = "/api/dtc_v3/forecast";
const HEALTH_PATH = "/api/dtc_v3/health";

// ───────────────────────────────────────────────────────────────────────
// 6 pre-defined demo products (YC pitch order: launch → ... → low-conf)
// Order matches friend's recommendation:
// Liquid IV → Athletic Brewing → Mattress → Oura → MUD\WTR → YETI
// ───────────────────────────────────────────────────────────────────────
export const DEMO_PRODUCTS = [
  {
    key: "liquid_iv",
    label: "Liquid IV (mass-market hydration)",
    expectedVerdict: "launch",
    cachedFile: "/demos/liquid_iv_v3_demo.json",
    brief: {
      product_name: "Liquid IV Hydration Multiplier",
      description: "Electrolyte drink mix powder. Costco, Target, Walmart.",
      price: 25,
      category: "supplements_health",
      demographic: "Active adults 22-50",
      competitors: [{ name: "LMNT" }, { name: "Pedialyte" }],
      market_tier_override: "mass_market",
      distribution_hint: "mass_retail",
      exclude_brand: "Liquid IV",
    },
  },
  {
    key: "athletic_brewing",
    label: "Athletic Brewing (NA craft beer)",
    expectedVerdict: "launch_with_changes",
    cachedFile: "/demos/athletic_brewing_v3_demo.json",
    brief: {
      product_name: "Athletic Brewing NA IPA",
      description: "Craft non-alcoholic IPA. Zero alcohol, 50 calories.",
      price: 13,
      category: "food_beverage",
      demographic: "Health-conscious adults 25-55",
      competitors: [{ name: "Heineken 0.0" }, { name: "Partake" }],
      exclude_brand: "Athletic Brewing",
    },
  },
  {
    key: "mattress",
    label: "Premium Mattress (do-not-launch case)",
    expectedVerdict: "do_not_launch_yet",
    cachedFile: "/demos/mattress_v3_demo.json",
    brief: {
      product_name: "LuxeFoam Mattress",
      description: "Premium memory foam mattress, 12-inch profile, queen size.",
      price: 1200,
      category: "home_lifestyle",
      demographic: "Adults 30-55 looking for sleep upgrade",
      competitors: [{ name: "Casper" }, { name: "Purple" }],
      exclude_brand: "LuxeFoam",
    },
  },
  {
    key: "oura",
    label: "Oura Ring (premium wearable)",
    expectedVerdict: "test_before_launch",
    cachedFile: "/demos/oura_v3_demo.json",
    brief: {
      product_name: "Oura Ring Gen 3",
      description: "Smart ring tracking sleep, heart rate, body temp.",
      price: 349,
      category: "electronics_tech",
      demographic: "Health-conscious professionals 28-50",
      competitors: [{ name: "Whoop" }],
      exclude_brand: "Oura",
    },
  },
  {
    key: "mudwtr",
    label: "MUD\\WTR (mushroom coffee alternative)",
    expectedVerdict: "test_before_launch",
    cachedFile: "/demos/mudwtr_v3_demo.json",
    brief: {
      product_name: "MUDWTR Coffee Alternative",
      description: "Mushroom and adaptogen-based coffee replacement powder.",
      price: 40,
      category: "food_beverage",
      demographic: "Wellness-curious 25-45 coffee replacers",
      competitors: [{ name: "Four Sigmatic" }, { name: "Ryze" }],
      exclude_brand: "MUD",
    },
  },
  {
    key: "yeti",
    label: "YETI Tumbler (low-confidence honesty)",
    expectedVerdict: "test_before_launch",
    cachedFile: "/demos/yeti_v3_demo.json",
    brief: {
      product_name: "YETI Rambler 20oz Tumbler",
      description: "Stainless steel insulated tumbler with magnetic slider lid.",
      price: 42,
      category: "home_lifestyle",
      demographic: "Outdoor enthusiasts",
      competitors: [{ name: "Stanley" }],
      exclude_brand: "YETI",
    },
  },
];

// ───────────────────────────────────────────────────────────────────────
// Live forecast — calls Railway production
// ───────────────────────────────────────────────────────────────────────
export async function forecastV3(productBrief) {
  const res = await fetch(`${V3_BASE}${FORECAST_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productBrief),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ───────────────────────────────────────────────────────────────────────
// Cached fallback — loads bundled JSON from /public/demos/
// Used on initial page load and as live-failure backup.
// ───────────────────────────────────────────────────────────────────────
export async function loadCachedDemo(cachedFilePath) {
  const res = await fetch(cachedFilePath);
  if (!res.ok) {
    throw new Error(`Cached demo not found: ${cachedFilePath}`);
  }
  return res.json();
}

// ───────────────────────────────────────────────────────────────────────
// Health check (optional, for debug)
// ───────────────────────────────────────────────────────────────────────
export async function healthV3() {
  const res = await fetch(`${V3_BASE}${HEALTH_PATH}`);
  return res.json();
}

// Expose base URL for display in UI footer
export const V3_BASE_URL = V3_BASE;
