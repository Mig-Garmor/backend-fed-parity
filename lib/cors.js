export function applyCors(req, res) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim());

  console.log("ALLOWED ORIGINS: ", allowedOrigins);

  console.log("ORIGIN: ", origin);

  const originAllowed = allowedOrigins.find((allowedOrigin) =>
    origin.includes(allowedOrigin)
  );

  if (originAllowed) {
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
