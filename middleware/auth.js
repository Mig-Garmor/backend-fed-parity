export function verifyApiKey(req, res, next) {
  const clientKey = req.headers["x-api-key"];
  if (!clientKey || clientKey !== process.env.API_KEY_CLIENT) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
