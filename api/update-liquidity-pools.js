import { verifyApiKey } from "../lib/auth.js";
import { redis } from "../lib/redisClient.js";

const TOKENS = [
  { name: "FED", tokenAddress: "0x1d177cb9efeea49a8b97ab1c72785a3a37abc9ff" },
];

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    if (!verifyApiKey(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const apiRes = await fetch(
      `https://api.dexscreener.com/token-pairs/v1/pulsechain/${TOKENS[0].tokenAddress}`
    );
    const pairs = await apiRes.json();

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

    await redis.set("liquidityPools", JSON.stringify(pairsFormattedData ?? []));

    return res.status(200).json({ message: "Pairs updated" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
