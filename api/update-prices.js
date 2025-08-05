import axios from "axios";
import { redis } from "../../lib/redisClient";
import { verifyApiKey } from "../../lib/auth";

const TOKENS = [
  { name: "PDAI", pairAddress: "0xfc64556faa683e6087f425819c7ca3c558e13ac1" },
  { name: "TBILL", pairAddress: "0x397e2c751915e1221afdcaf799302881b6ea7001" },
  { name: "FED", pairAddress: "0x333502d557a40fec45350bef9c07f9c53244559a" },
];

export default async function handler(req, res) {
  if (!verifyApiKey(req, res)) return;

  try {
    const prices = {};

    for (const token of TOKENS) {
      try {
        const response = await axios.get(
          `https://api.dexscreener.com/latest/dex/pairs/pulsechain/${token.pairAddress}`
        );
        const pair = response.data.pairs?.[0];

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

    res.status(200).json({ message: "Prices updated", prices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
