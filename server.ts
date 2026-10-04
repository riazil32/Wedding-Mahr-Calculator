import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TROY_OUNCE_IN_GRAMS = 31.1034768;
const FALLBACK_GOLD_GBP_GRAM = 109.10;
const FALLBACK_SILVER_GBP_GRAM = 1.67;

// Helper to compute Haversine distance in km
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const NOMINATIM_HEADERS = {
  "User-Agent": "HisabBayt/1.0 (Islamic Finance & Masjid Locator)",
  "Accept-Language": "en-GB,en;q=0.9",
};

// Fetch nearby masjids and surrounding public facilities via Nominatim jsonv2 with extratags
async function fetchNearbyMasjidsAndFacilities(
  location?: { lat: number; lng: number },
  query?: string
) {
  let centerLat = location?.lat;
  let centerLng = location?.lng;

  if ((typeof centerLat !== "number" || typeof centerLng !== "number") && query) {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
      { headers: NOMINATIM_HEADERS }
    );
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (Array.isArray(geoData) && geoData.length > 0) {
        centerLat = parseFloat(geoData[0].lat);
        centerLng = parseFloat(geoData[0].lon);
      }
    }
  }

  if (typeof centerLat !== "number" || typeof centerLng !== "number" || isNaN(centerLat) || isNaN(centerLng)) {
    return { center: null, masjids: [] };
  }

  const searchBoundingBox = async (delta: number) => {
    const viewbox = `${centerLng! - delta},${centerLat! + delta},${centerLng! + delta},${centerLat! - delta}`;
    const terms = ["mosque", "masjid", "islamic centre"];
    const urls = terms.map(
      (term) =>
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&limit=20&bounded=1&viewbox=${viewbox}&q=${encodeURIComponent(term)}`
    );
    const responses = await Promise.all(
      urls.map((u) =>
        fetch(u, { headers: NOMINATIM_HEADERS })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => [])
      )
    );
    return responses.flat();
  };

  // First search within ~8km box; if none found, expand to ~25km box
  let rawPlaces = await searchBoundingBox(0.08);
  if (rawPlaces.length === 0) {
    rawPlaces = await searchBoundingBox(0.25);
  }

  // Also fetch nearby public parking & halal/cafe facilities in the area for proximity matching
  const facDelta = 0.06;
  const facViewbox = `${centerLng - facDelta},${centerLat + facDelta},${centerLng + facDelta},${centerLat - facDelta}`;
  const [parkingList, cafeList] = await Promise.all([
    fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=30&bounded=1&viewbox=${facViewbox}&q=parking`,
      { headers: NOMINATIM_HEADERS }
    )
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []),
    fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=30&bounded=1&viewbox=${facViewbox}&q=cafe`,
      { headers: NOMINATIM_HEADERS }
    )
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []),
  ]);

  // Deduplicate masjids by osm_id or rounded coordinates
  const seen = new Set<string>();
  const uniquePlaces: any[] = [];

  for (const place of rawPlaces) {
    const pLat = parseFloat(place.lat);
    const pLng = parseFloat(place.lon);
    if (isNaN(pLat) || isNaN(pLng)) continue;
    const coordKey = `${pLat.toFixed(3)},${pLng.toFixed(3)}`;
    const idKey = place.osm_id ? String(place.osm_id) : coordKey;
    if (seen.has(idKey) || seen.has(coordKey)) continue;
    seen.add(idKey);
    seen.add(coordKey);
    uniquePlaces.push(place);
  }

  const masjids = uniquePlaces
    .map((place) => {
      const mLat = parseFloat(place.lat);
      const mLng = parseFloat(place.lon);
      const addr = place.address || {};
      const extra = place.extratags || {};

      const name =
        place.name ||
        (place.display_name ? place.display_name.split(",")[0] : "Local Masjid & Prayer Centre");

      const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
      const locality = addr.suburb || addr.neighbourhood || addr.city || addr.town || "";
      const postcode = addr.postcode || "";
      const address =
        [street, locality, postcode].filter(Boolean).join(", ") ||
        place.display_name?.split(",").slice(1, 4).join(",").trim() ||
        "View location on Google Maps";

      const distKm = getDistanceKm(centerLat!, centerLng!, mLat, mLng);
      const distMiles = distKm * 0.621371;
      const walkMins = Math.max(2, Math.round((distKm / 4.8) * 60));
      const cycleMins = Math.max(1, Math.round((distKm / 16) * 60));
      const driveMins = Math.max(2, Math.round((distKm / 28) * 60 + 2));

      // Determine supported prayers
      const lowerName = name.toLowerCase();
      const prayers = ["Daily Jama'ah", "Jumu'ah", "Taraweeh"];
      if (
        lowerName.includes("mosque") ||
        lowerName.includes("masjid") ||
        lowerName.includes("islamic") ||
        lowerName.includes("central") ||
        lowerName.includes("jamia") ||
        lowerName.includes("trust") ||
        lowerName.includes("cultural")
      ) {
        prayers.push("Eid Prayers");
      }

      // Build public facilities next to / at the masjid
      const facilitiesSet = new Set<string>();
      facilitiesSet.add("Wudu & Prayer Hall");

      if (extra.female === "yes" || extra["women"] === "yes") {
        facilitiesSet.add("Sisters' Prayer Space");
      }
      if (extra.wheelchair === "yes") {
        facilitiesSet.add("Wheelchair Accessible");
      }
      if (extra.toilets === "yes" || extra["toilets:wheelchair"] === "yes") {
        facilitiesSet.add("Public Restrooms On-Site");
      }

      // Check proximity to public parking & cafés/restaurants
      const hasNearbyParking = Array.isArray(parkingList) && parkingList.some((p: any) => {
        const fLat = parseFloat(p.lat);
        const fLng = parseFloat(p.lon);
        return !isNaN(fLat) && !isNaN(fLng) && getDistanceKm(mLat, mLng, fLat, fLng) <= 0.6;
      });
      if (hasNearbyParking) {
        facilitiesSet.add("Public Parking Nearby");
      } else {
        facilitiesSet.add("Local Street Access");
      }

      const hasNearbyCafe = Array.isArray(cafeList) && cafeList.some((c: any) => {
        const fLat = parseFloat(c.lat);
        const fLng = parseFloat(c.lon);
        return !isNaN(fLat) && !isNaN(fLng) && getDistanceKm(mLat, mLng, fLat, fLng) <= 0.6;
      });
      if (hasNearbyCafe) {
        facilitiesSet.add("Cafés & Refreshments Nearby");
      }

      if (addr.road || addr.suburb) {
        facilitiesSet.add("Public Bus / Transit Links");
      }

      return {
        name,
        address,
        distanceKm: distKm,
        distance: `${distMiles.toFixed(1)} mi (${distKm.toFixed(1)} km)`,
        walkTime: `${walkMins} mins`,
        cycleTime: `${cycleMins} mins`,
        driveTime: `${driveMins} mins`,
        prayers,
        facilities: Array.from(facilitiesSet).slice(0, 5),
        website: extra.website || extra["contact:website"] || undefined,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${name} ${postcode || address}`
        )}`,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 8);

  return { center: { lat: centerLat, lng: centerLng }, masjids };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route for Live Gold & Silver Market Rates (GBP/gram)
  app.get("/api/market-rates", async (_req, res) => {
    try {
      const [xauRes, xagRes, fxRes] = await Promise.all([
        fetch("https://api.gold-api.com/price/XAU"),
        fetch("https://api.gold-api.com/price/XAG"),
        fetch("https://open.er-api.com/v6/latest/USD"),
      ]);

      if (!xauRes.ok || !xagRes.ok || !fxRes.ok) {
        throw new Error("Upstream market rate API unavailable");
      }

      const [xauData, xagData, fxData] = await Promise.all([
        xauRes.json(),
        xagRes.json(),
        fxRes.json(),
      ]);

      const usdToGbp = Number(fxData?.rates?.GBP) || 0.78;
      const goldUsdOz = Number(xauData?.price);
      const silverUsdOz = Number(xagData?.price);

      const goldGbpGram = goldUsdOz > 0
        ? Number(((goldUsdOz * usdToGbp) / TROY_OUNCE_IN_GRAMS).toFixed(2))
        : FALLBACK_GOLD_GBP_GRAM;
      const silverGbpGram = silverUsdOz > 0
        ? Number(((silverUsdOz * usdToGbp) / TROY_OUNCE_IN_GRAMS).toFixed(2))
        : FALLBACK_SILVER_GBP_GRAM;

      return res.json({
        gold: { price: goldGbpGram, currency: "GBP", unit: "gram" },
        silver: { price: silverGbpGram, currency: "GBP", unit: "gram" },
        isLive: true,
      });
    } catch {
      return res.json({
        gold: { price: FALLBACK_GOLD_GBP_GRAM, currency: "GBP", unit: "gram" },
        silver: { price: FALLBACK_SILVER_GBP_GRAM, currency: "GBP", unit: "gram" },
        isLive: false,
      });
    }
  });

  // API Route for Masjid Finder using Gemini Maps Grounding + Nominatim Facility Enrichment
  app.post("/api/find-masjids", express.json(), async (req, res) => {
    try {
      const { location, query, prayerFilter } = req.body || {};

      // 1. Fetch structured nearby masjids and adjacent public facilities
      const osmResult = await fetchNearbyMasjidsAndFacilities(location, query);
      const resolvedLocation = osmResult.center || location;

      let groundingSummary = "";
      let groundingLinks: { title: string; uri: string; reviewSnippets?: string[] }[] = [];

      // 2. Call Gemini with Google Maps Grounding when GEMINI_API_KEY is available
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey.trim() !== "" && !apiKey.includes("YOUR_")) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          const locationDesc = query
            ? `near "${query}"`
            : resolvedLocation
            ? `near latitude ${resolvedLocation.lat}, longitude ${resolvedLocation.lng}`
            : "near my current location";

          const prayerFocus = prayerFilter && prayerFilter !== "all"
            ? `Especially highlight suitability for ${prayerFilter}.`
            : "Highlight suitability for daily Jama'ah, Jumu'ah prayers, Taraweeh prayers, and Eid prayers.";

          const prompt = `Find the closest masjids and Islamic prayer centres ${locationDesc}. ${prayerFocus}
For each masjid, describe:
- Prayer services (Daily Jama'ah, Jumu'ah, Taraweeh, Eid prayers)
- Publicly available facilities next to or at the masjid (such as public parking, bus/train links, halal cafés/restaurants, wudu/restrooms, wheelchair access, and sisters' facilities).`;

          const config: any = {
            tools: [{ googleMaps: {} }],
          };

          if (resolvedLocation?.lat && resolvedLocation?.lng) {
            config.toolConfig = {
              retrievalConfig: {
                latLng: {
                  latitude: Number(resolvedLocation.lat),
                  longitude: Number(resolvedLocation.lng),
                },
              },
            };
          }

          let response;
          try {
            response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: prompt,
              config,
            });
          } catch {
            response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: prompt,
              config,
            });
          }

          groundingSummary = response.text || "";

          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          chunks.forEach((chunk: any) => {
            if (chunk?.maps?.uri) {
              const snippets: string[] = [];
              const reviewSnippets = chunk.maps?.placeAnswerSources?.reviewSnippets;
              if (Array.isArray(reviewSnippets)) {
                reviewSnippets.forEach((s: any) => {
                  const text = s?.text || s?.reviewText || s?.snippet;
                  if (typeof text === "string" && text.trim()) {
                    snippets.push(text.trim());
                  }
                });
              }
              groundingLinks.push({
                title: chunk.maps.title || "View on Google Maps",
                uri: chunk.maps.uri,
                reviewSnippets: snippets.length > 0 ? snippets : undefined,
              });
            }
          });
        } catch (geminiErr) {
          console.warn("Maps grounding lookup skipped or unavailable:", geminiErr instanceof Error ? geminiErr.message : geminiErr);
        }
      }

      let masjids = osmResult.masjids;
      if (masjids.length === 0 && groundingLinks.length > 0) {
        masjids = groundingLinks.map((link) => ({
          name: link.title,
          address: query ? `Near ${query}` : "Verified on Google Maps",
          distanceKm: 0,
          distance: "Nearby",
          walkTime: "—",
          cycleTime: "—",
          driveTime: "—",
          prayers: ["Daily Jama'ah", "Jumu'ah", "Taraweeh", "Eid Prayers"],
          facilities: ["Wudu & Prayer Hall", "Public Transit Nearby", "Nearby Public Parking"],
          website: undefined,
          mapsUrl: link.uri,
        }));
      }

      return res.json({
        masjids,
        groundingSummary,
        groundingLinks,
      });
    } catch (error) {
      console.error("Error in /api/find-masjids:", error);
      return res.status(500).json({ error: "Unable to complete masjid search" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
