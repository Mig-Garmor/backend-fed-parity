// api/update-liquidity-pools.js

const CHAIN_ID = "pulsechain";

// Exact pairs you trust.
// Stop trying to discover these dynamically if you already know them.
const SOURCES = {
  PDAI: {
    pairAddress: "0x0633c0060EA4e5bDe3345fdbB5D5A3b9c8d1A325",
    // Price the quote token from the FED/DAI pool
    tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
  },
  TBILL: {
    pairAddress: "0xAd2C3Fc5a5a5408b174811758102Eb3c77627b5C",
    tokenAddress: "0x463413c579D29c26D59a65312657DFCe30D545A1", // TBILL
  },
  FED: {
    pairAddress: "0xAd2C3Fc5a5a5408b174811758102Eb3c77627b5C",
    tokenAddress: "0x1D177CB9EfEEa49A8B97ab1C72785a3A37ABc9Ff", // FED / F㉾D
  },
};

function normalizeAddress(address) {
  return String(address || "").toLowerCase();
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Dexscreener semantics:
 * - priceUsd = USD price of baseToken
 * - priceNative = price of baseToken in quoteToken units
 *
 * Therefore:
 * - if target is baseToken: targetUsd = priceUsd
 * - if target is quoteToken: targetUsd = priceUsd / priceNative
 */
function extractUsdPriceForToken(pair, tokenAddress) {
  const target = normalizeAddress(tokenAddress);
  const base = normalizeAddress(pair?.baseToken?.address);
  const quote = normalizeAddress(pair?.quoteToken?.address);

  const baseUsd = toNumber(pair?.priceUsd);
  const priceNative = toNumber(pair?.priceNative);

  if (!baseUsd) {
    throw new Error(
      `Missing or invalid priceUsd for pair ${pair?.pairAddress || "unknown"}`,
    );
  }

  if (target === base) {
    return baseUsd;
  }

  if (target === quote) {
    if (!priceNative || priceNative === 0) {
      throw new Error(
        `Missing or invalid priceNative for quote-token calculation in pair ${pair?.pairAddress || "unknown"}`,
      );
    }

    return baseUsd / priceNative;
  }

  throw new Error(
    `Token ${tokenAddress} not found in pair ${pair?.pairAddress || "unknown"}`,
  );
}

async function fetchPair(pairAddress) {
  const url = `https://api.dexscreener.com/latest/dex/pairs/${CHAIN_ID}/${pairAddress}`;

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Dexscreener request failed: ${res.status} ${res.statusText}`,
    );
  }

  const json = await res.json();

  // Dexscreener commonly returns pairs[]; your example also shows pair.
  const pair = json?.pair || json?.pairs?.[0];

  if (!pair) {
    throw new Error(`No pair returned for ${pairAddress}`);
  }

  return pair;
}

export default async function handler(req, res) {
  try {
    const entries = await Promise.all(
      Object.entries(SOURCES).map(async ([key, config]) => {
        const pair = await fetchPair(config.pairAddress);
        const usdPrice = extractUsdPriceForToken(pair, config.tokenAddress);

        return [
          key,
          {
            price: usdPrice.toFixed(9).replace(/\.?0+$/, ""), // trims trailing zeros
            lastUpdated: new Date().toISOString(),
          },
        ];
      }),
    );

    const result = Object.fromEntries(entries);

    return res.status(200).json(result);
  } catch (error) {
    console.error("update-liquidity-pools failed:", error);
    return res.status(500).json({
      error: "Failed to update liquidity pools",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
