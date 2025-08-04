import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { updatePrices } from "./fetcher.js";
import { verifyApiKey } from "./middleware/auth.js";
import { kv } from "@vercel/kv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS with whitelist
const allowedOrigin = process.env.ALLOWED_ORIGIN;
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// API route (secured)
app.get("/api/prices", verifyApiKey, async (req, res) => {
  try {
    const tokenPrices = await kv.get("tokenPrices");
    if (!tokenPrices) {
      return res.status(404).json({ message: "Prices not found" });
    }
    res.json(tokenPrices);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch prices", error: err.message });
  }
});

app.get("/cron/update-prices", async (req, res) => {
  try {
    await updatePrices();
    res.status(200).json({ message: "Prices updated successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update prices", error: err.message });
  }
});

updatePrices();

setTimeout(() => {
  updatePrices();
}, 1000);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
