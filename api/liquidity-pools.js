import { redis } from "../lib/redisClient.js";
import { applyCors } from "../lib/cors.js";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;

  try {
    const cached = await redis.get("liquidityPools");

    if (!cached) {
      return res.status(404).json({ message: "No LPs found" });
    }

    const liquidityPools =
      typeof cached === "string" ? JSON.parse(cached) : cached;

    res.status(200).json(liquidityPools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
