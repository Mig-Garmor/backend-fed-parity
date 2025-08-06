export function verifyApiKey(request) {
  const authHeader =
    request.headers["authorization"] || request.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.split(" ")[1];
  return token === process.env.API_KEY_CLIENT;
}
