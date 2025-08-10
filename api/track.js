import { redis } from "../lib/redisClient.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const event = req.body;

    await redis.lpush("site:events", JSON.stringify(event));
    await redis.ltrim("site:events", 0, 499);

    return res.status(200).json({ ok: true });
  }
  res.status(405).end();
}
