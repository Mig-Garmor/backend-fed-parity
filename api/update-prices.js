import { verifyApiKey } from "../lib/auth.js";
import { redis } from "../lib/redisClient.js";

const TOKENS = [
  { name: "PDAI", pairAddress: "0xfc64556faa683e6087f425819c7ca3c558e13ac1" },
  { name: "TBILL", pairAddress: "0x397e2c751915e1221afdcaf799302881b6ea7001" },
  { name: "FED", pairAddress: "0x333502d557a40fec45350bef9c07f9c53244559a" },
];

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    if (!verifyApiKey(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const prices = {};

    for (const token of TOKENS) {
      try {
        const res = await fetch(
          `https://api.dexscreener.com/latest/dex/pairs/pulsechain/${token.pairAddress}`
        );
        const data = await res.json();
        const pair = data.pairs?.[0];

        prices[token.name] = {
          price: pair?.priceUsd || null,
          lastUpdated: new Date().toISOString(),
        };
      } catch (err) {
        prices[token.name] = {
          error: true,
          message: err.message,
          lastUpdated: new Date().toISOString(),
        };
      }
    }

    await redis.set("tokenPrices", JSON.stringify(prices));

    return res.status(200).json({ message: "Prices updated", prices });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
