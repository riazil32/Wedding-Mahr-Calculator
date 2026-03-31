import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route for Market Rates
  app.get("/api/market-rates", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.warn("API Key Missing: Please check your .env file.");
        return res.status(500).json({ error: "API Key Missing" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `What is the current market price of Gold and Silver for today? 
        Please provide the prices in JSON format with the following structure:
        {
          "gold": { "price": number, "currency": "USD" | "GBP", "unit": "gram" | "ounce" },
          "silver": { "price": number, "currency": "USD" | "GBP", "unit": "gram" | "ounce" }
        }
        Ensure you are providing the most accurate current market data.`,
      });

      const text = response.text || "";
      console.log("Raw API Response for Market Rates (Server):", text);
      
      const match = text.match(/\{.*\}/s);
      if (match) {
        const data = JSON.parse(match[0]);
        return res.json(data);
      }

      throw new Error("Invalid API response format");
    } catch (error) {
      console.error("Failed to fetch live market rates on server:", error);
      res.status(500).json({ error: "Failed to fetch market rates" });
    }
  });

  // API Route for Masjid Finder
  app.post("/api/find-masjids", express.json(), async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { location, query } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: "API Key Missing" });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const locationDesc = query ? `postcode ${query}` : `my current location`;
      const prompt = `Find the closest masjids to ${locationDesc}. 
      
      For each masjid, provide: name, address, approx distance, and estimated travel times (drive, walk, cycle).
      
      Return the data as a JSON object with one key: "masjids" (array).
      Masjid object keys: name, address, distance, driveTime, walkTime, cycleTime, mapsUrl.`;

      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (location) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return res.json(data);
      } else {
        throw new Error("Could not parse search data");
      }
    } catch (error) {
      console.error("Failed to find masjids on server:", error);
      res.status(500).json({ error: "Failed to find results" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
