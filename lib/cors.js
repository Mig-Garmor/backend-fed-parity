function normalizeOrigin(origin) {
  return origin.replace(/\/+$/, ""); // remove trailing slash(es)
}

export function applyCors(req, res) {
  const origin = normalizeOrigin(req.headers.origin || "");
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim());

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-API-KEY"
    );
  } else {
    console.log("Origin not allowed");
    return false;
  }

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return false;
  }

  return true;
}
