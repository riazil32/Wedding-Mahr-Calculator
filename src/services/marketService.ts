
const CACHE_KEY = 'hisabbayt_market_cache';
const COOLDOWN_KEY = 'hisabbayt_market_cooldown';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes

// Hardcoded Fallbacks (Market Standards)
export const FALLBACK_GOLD_PRICE = 109.10; // £/g
export const FALLBACK_SILVER_PRICE = 1.67; // £/g

export interface MarketRates {
  gold: number;
  silver: number;
  timestamp: number;
  isLive: boolean;
}

export const getLiveMarketRates = async (force = false): Promise<MarketRates> => {
  try {
    // 1. Check Cache
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { gold, silver, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log("Using cached market rates:", { gold, silver });
          return { gold, silver, timestamp, isLive: true };
        }
      }
    }

    // 2. Check Cooldown for manual refresh
    if (force) {
      const cooldown = localStorage.getItem(COOLDOWN_KEY);
      if (cooldown && Date.now() - parseInt(cooldown) < COOLDOWN_DURATION) {
        console.warn("Manual refresh is on cooldown.");
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { gold, silver, timestamp } = JSON.parse(cached);
          return { gold, silver, timestamp, isLive: true };
        }
      }
    }

    // 3. Fetch from Server-Side API
    const response = await fetch("/api/market-rates");
    if (!response.ok) {
      throw new Error("Failed to fetch market rates from server");
    }

    const data = await response.json();
    const now = Date.now();
    
    const convertToGbpGram = (item: any) => {
      let price = item.price;
      // Unit Verification: If Ounce, divide by 31.1035
      if (item.unit.toLowerCase().includes('ounce') || item.unit.toLowerCase().includes('oz')) {
        price = price / 31.1035;
      }
      // Currency Conversion: If USD, multiply by 0.79
      if (item.currency.toUpperCase() === 'USD') {
        price = price * 0.79;
      }
      return price;
    };

    const gold = convertToGbpGram(data.gold) || FALLBACK_GOLD_PRICE;
    const silver = convertToGbpGram(data.silver) || FALLBACK_SILVER_PRICE;

    // Accuracy Check (Safety bounds)
    // If gold is wildly off (e.g. < 50 or > 200), use fallback
    const finalGold = (gold < 50 || gold > 200) ? FALLBACK_GOLD_PRICE : gold;
    const finalSilver = (silver < 0.5 || silver > 5) ? FALLBACK_SILVER_PRICE : silver;

    // Save to cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({ gold: finalGold, silver: finalSilver, timestamp: now }));
    if (force) localStorage.setItem(COOLDOWN_KEY, now.toString());

    return { gold: finalGold, silver: finalSilver, timestamp: now, isLive: true };

  } catch (error) {
    console.error("Failed to fetch live market rates, using fallbacks:", error);
    return {
      gold: FALLBACK_GOLD_PRICE,
      silver: FALLBACK_SILVER_PRICE,
      timestamp: Date.now(),
      isLive: false
    };
  }
};
