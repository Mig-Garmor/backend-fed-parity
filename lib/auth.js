export function verifyApiKey(request) {
  const headers = Object.fromEntries(
    Object.entries(request.headers).map(([k, v]) => [k.toLowerCase(), v])
  );
  const authHeader = headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.split(" ")[1];
  console.log("TOKEN: ", token);
  console.log("API_KEY_CLIENT: ", process.env.API_KEY_CLIENT);
  return token === process.env.API_KEY_CLIENT;
}
