const CACHE_KEY = 'hisabbayt_market_cache';
const COOLDOWN_KEY = 'hisabbayt_market_cooldown';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes
const TROY_OUNCE_IN_GRAMS = 31.1034768;

// Hardcoded Fallbacks (Market Standards)
export const FALLBACK_GOLD_PRICE = 109.10; // £/g
export const FALLBACK_SILVER_PRICE = 1.67; // £/g

export interface MarketRates {
  gold: number;
  silver: number;
  timestamp: number;
  isLive: boolean;
}

const fetchDirectMetalsRates = async (): Promise<{ gold: number; silver: number } | null> => {
  try {
    const [xauRes, xagRes, fxRes] = await Promise.all([
      fetch("https://api.gold-api.com/price/XAU"),
      fetch("https://api.gold-api.com/price/XAG"),
      fetch("https://open.er-api.com/v6/latest/USD"),
    ]);

    if (!xauRes.ok || !xagRes.ok || !fxRes.ok) {
      return null;
    }

    const [xauData, xagData, fxData] = await Promise.all([
      xauRes.json(),
      xagRes.json(),
      fxRes.json(),
    ]);

    const usdToGbp = Number(fxData?.rates?.GBP) || 0.78;
    const goldUsdOz = Number(xauData?.price);
    const silverUsdOz = Number(xagData?.price);

    if (!goldUsdOz || !silverUsdOz) {
      return null;
    }

    return {
      gold: Number(((goldUsdOz * usdToGbp) / TROY_OUNCE_IN_GRAMS).toFixed(2)),
      silver: Number(((silverUsdOz * usdToGbp) / TROY_OUNCE_IN_GRAMS).toFixed(2)),
    };
  } catch {
    return null;
  }
};

export const getLiveMarketRates = async (force = false): Promise<MarketRates> => {
  try {
    // 1. Check Cache
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { gold, silver, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return { gold, silver, timestamp, isLive: true };
        }
      }
    }

    // 2. Check Cooldown for manual refresh
    if (force) {
      const cooldown = localStorage.getItem(COOLDOWN_KEY);
      if (cooldown && Date.now() - parseInt(cooldown) < COOLDOWN_DURATION) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { gold, silver, timestamp } = JSON.parse(cached);
          return { gold, silver, timestamp, isLive: true };
        }
      }
    }

    const now = Date.now();
    let gold = FALLBACK_GOLD_PRICE;
    let silver = FALLBACK_SILVER_PRICE;
    let isLive = false;

    // 3. Try Direct Live Metals API first (works both locally and on Netlify static hosting)
    const directRates = await fetchDirectMetalsRates();
    if (directRates) {
      gold = directRates.gold;
      silver = directRates.silver;
      isLive = true;
    } else {
      // 4. Fallback to Server-Side API if direct browser call failed
      const response = await fetch("/api/market-rates");
      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("application/json")) {
        const data = await response.json();
        const convertToGbpGram = (item: any) => {
          if (!item || typeof item.price !== "number") return 0;
          let price = item.price;
          const unit = (item.unit || "gram").toLowerCase();
          if (unit.includes("ounce") || unit.includes("oz")) {
            price = price / TROY_OUNCE_IN_GRAMS;
          }
          if ((item.currency || "GBP").toUpperCase() === "USD") {
            price = price * 0.78;
          }
          return Number(price.toFixed(2));
        };

        const serverGold = convertToGbpGram(data.gold);
        const serverSilver = convertToGbpGram(data.silver);
        if (serverGold > 0 && serverSilver > 0) {
          gold = serverGold;
          silver = serverSilver;
          isLive = data.isLive !== false;
        }
      }
    }

    // Accuracy Check (Safety bounds)
    const finalGold = (gold < 30 || gold > 300) ? FALLBACK_GOLD_PRICE : gold;
    const finalSilver = (silver < 0.3 || silver > 10) ? FALLBACK_SILVER_PRICE : silver;

    // Save to cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({ gold: finalGold, silver: finalSilver, timestamp: now }));
    if (force) localStorage.setItem(COOLDOWN_KEY, now.toString());

    return { gold: finalGold, silver: finalSilver, timestamp: now, isLive };
  } catch {
    return {
      gold: FALLBACK_GOLD_PRICE,
      silver: FALLBACK_SILVER_PRICE,
      timestamp: Date.now(),
      isLive: false
    };
  }
};
