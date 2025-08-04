import axios from "axios";
import { kv } from "@vercel/kv";

export const tokenPrices = (await kv.get("tokenPrices")) || {};
const TOKENS = [
  { name: "PDAI", pairAddress: "0xfc64556faa683e6087f425819c7ca3c558e13ac1" },
  { name: "TBILL", pairAddress: "0x397e2c751915e1221afdcaf799302881b6ea7001" },
  { name: "FED", pairAddress: "0x333502d557a40fec45350bef9c07f9c53244559a" },
];

export async function updatePrices() {
  const tokensData = TOKENS.map(async (token) => {
    try {
      const res = await axios.get(
        `https://api.dexscreener.com/latest/dex/pairs/pulsechain/${token.pairAddress}`
      );
      const pair = res.data.pairs?.[0];
      return {
        price: pair?.priceUsd || null,
        lastUpdated: new Date().toISOString(),
      };
    } catch (err) {
      tokenPrices[token.name] = {
        error: true,
        message: err.message,
        lastUpdated: new Date().toISOString(),
      };
    }
  });

  const prices = await Promise.all(tokensData);
  tokenPrices["PDAI"] = prices[0];
  tokenPrices["TBILL"] = prices[1];
  tokenPrices["FED"] = prices[2];
  await kv.set("tokenPrices", tokenPrices);
}
