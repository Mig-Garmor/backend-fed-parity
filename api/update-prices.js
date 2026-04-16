import { verifyApiKey } from "../lib/auth.js";
import { redis } from "../lib/redisClient.js";

const CHAIN_ID = "pulsechain";

// Define the exact pair and exact token to price.
// Do not infer by symbol. Do not infer by “most liquid”. Do not discover dynamically.
const TOKENS = [
  {
    name: "PDAI",
    pairAddress: "0xfc64556faa683e6087f425819c7ca3c558e13ac1",
    tokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
  },
  {
    name: "TBILL",
    pairAddress: "0x397e2c751915e1221afdcaf799302881b6ea7001",
    tokenAddress: "0x463413c579d29c26d59a65312657dfce30d545a1",
  },
  {
    name: "FED",
    pairAddress: "0x333502d557a40fec45350bef9c07f9c53244559a",
    tokenAddress: "0x1d177cb9efeea49a8b97ab1c72785a3a37abc9ff",
  },
];

export const config = {
  runtime: "nodejs",
};

function normalizeAddress(address) {
  return String(address || "").toLowerCase();
}

function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Dexscreener semantics used here:
 * - priceUsd = USD price of the base token
 * - priceNative = price of the base token in quote-token units
 *
 * Therefore:
 * - target === baseToken => target price is priceUsd
 * - target === quoteToken => target price is priceUsd / priceNative
 */
function getUsdPriceFromPair(pair, targetTokenAddress) {
  const baseAddress = normalizeAddress(pair?.baseToken?.address);
  const quoteAddress = normalizeAddress(pair?.quoteToken?.address);
  const targetAddress = normalizeAddress(targetTokenAddress);

  const baseUsdPrice = toFiniteNumber(pair?.priceUsd);
  const baseInQuote = toFiniteNumber(pair?.priceNative);

  if (baseUsdPrice === null) {
    throw new Error(
      `Missing or invalid priceUsd for pair ${pair?.pairAddress || "unknown"}`,
    );
  }

  if (targetAddress === baseAddress) {
    return baseUsdPrice;
  }

  if (targetAddress === quoteAddress) {
    if (baseInQuote === null || baseInQuote === 0) {
      throw new Error(
        `Missing or invalid priceNative for pair ${pair?.pairAddress || "unknown"}`,
      );
    }

    return baseUsdPrice / baseInQuote;
  }

  throw new Error(
    `Target token ${targetTokenAddress} is not base or quote in pair ${pair?.pairAddress || "unknown"}`,
  );
}

function formatPrice(price) {
  // Keep precision but avoid ugly trailing zeros
  return price.toFixed(9).replace(/\.?0+$/, "");
}

export default async function handler(req, res) {
  try {
    if (!verifyApiKey(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const prices = {};

    for (const token of TOKENS) {
      const now = new Date().toISOString();

      try {
        const apiResponse = await fetch(
          `https://api.dexscreener.com/latest/dex/pairs/${CHAIN_ID}/${token.pairAddress}`,
          {
            headers: {
              accept: "application/json",
            },
          },
        );

        if (!apiResponse.ok) {
          throw new Error(
            `Dexscreener request failed: ${apiResponse.status} ${apiResponse.statusText}`,
          );
        }

        const data = await apiResponse.json();
        const pair = data?.pairs?.[0];

        if (!pair) {
          throw new Error(`No pair returned for ${token.name}`);
        }

        const usdPrice = getUsdPriceFromPair(pair, token.tokenAddress);

        prices[token.name] = {
          price: formatPrice(usdPrice),
          lastUpdated: now,
        };
      } catch (err) {
        prices[token.name] = {
          error: true,
          message: err.message,
          lastUpdated: now,
        };
      }
    }

    await redis.set("tokenPrices", JSON.stringify(prices));

    return res.status(200).json({
      message: "Prices updated",
      prices,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
