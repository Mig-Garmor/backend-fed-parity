import { verifyApiKey } from "../lib/auth.js";
import { applyCors } from "../lib/cors.js";

const TOKENS = [
  { name: "FED", tokenAddress: "0x1d177cb9efeea49a8b97ab1c72785a3a37abc9ff" },
];

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  //   if (!verifyApiKey(req)) {
  //     return res.status(401).json({ error: "Unauthorized" });
  //   }
  if (!applyCors(req, res)) return;

  try {
    const apiRes = await fetch(
      `https://api.dexscreener.com/token-pairs/v1/pulsechain/${TOKENS[0].tokenAddress}`
    );
    const pairs = await apiRes.json();
    console.log("TOKEN PAIRS: ", pairs);
    const pairsFormattedData = pairs.map((pair) => ({
      pairAddress: pair.pairAddress,
      baseToken: {
        address: pair.baseToken.address,
        symbol: pair.baseToken.symbol,
      },
      quoteToken: {
        address: pair.quoteToken.address,
        symbol: pair.quoteToken.symbol,
      },
      volume: {
        h24: pair.volume.h24,
      },
      liquidity: {
        total: pair.liquidity?.usd || "",
        baseToken: pair.liquidity?.base || "",
        quoteToken: pair.liquidity?.quote || "",
      },
      pairCreationTime: pair.pairCreatedAt,
    }));
    // console.log("PAIRS FORMATTED DATA: ", pairsFormattedData);
    // const pair = data.pairs?.[0];

    // prices[token.name] = {
    //   price: pair?.priceUsd || null,
    //   lastUpdated: new Date().toISOString(),
    // };
    return res
      .status(200)
      .json({ message: "Pairs updated", pairs: pairsFormattedData });
  } catch (err) {
    // prices[token.name] = {
    //   error: true,
    //   message: err.message,
    //   lastUpdated: new Date().toISOString(),
    // };
    return res.status(500).json({ error: err.message });
  }
}
