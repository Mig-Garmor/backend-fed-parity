// lib/auth.js
export function verifyApiKey(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  const token = authHeader.split(" ")[1];
  if (token !== process.env.API_SECRET_KEY) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }

  return true;
}
