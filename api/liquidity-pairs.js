import { verifyApiKey } from "../lib/auth.js";

const TOKENS = [
  { name: "FED", tokenAddress: "0x1d177cb9efeea49a8b97ab1c72785a3a37abc9ff" },
];

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    // if (!verifyApiKey(req)) {
    //   return res.status(401).json({ error: "Unauthorized" });
    // }

    const prices = {};

    for (const token of TOKENS) {
      try {
        const res = await fetch(
          `https://api.dexscreener.com/token-pairs/v1/pulsechain/${token.pairAddress}`
        );
        const data = await res.json();
        console.log("TOKEN PAIR: ", data);
        // const pair = data.pairs?.[0];

        // prices[token.name] = {
        //   price: pair?.priceUsd || null,
        //   lastUpdated: new Date().toISOString(),
        // };
      } catch (err) {
        // prices[token.name] = {
        //   error: true,
        //   message: err.message,
        //   lastUpdated: new Date().toISOString(),
        // };
      }
    }

    // await redis.set("tokenPrices", JSON.stringify(prices));

    // return res.status(200).json({ message: "Prices updated", prices });
  } catch (err) {
    // return res.status(500).json({ error: err.message });
  }
}
