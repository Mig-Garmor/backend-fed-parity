import { redis } from "../lib/redisClient.js";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  console.log("here");
  try {
    const cached = await redis.get("tokenPrices");

    if (!cached) {
      return res.status(404).json({ message: "No prices found" });
    }

    const prices = typeof cached === "string" ? JSON.parse(cached) : cached;

    res.status(200).json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
