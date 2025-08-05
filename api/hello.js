export const config = { runtime: "edge" };

export default function handler(req, res) {
  if (req.method === "POST") {
    const { name } = req.body;
    res.status(200).json({ message: `Hello, ${name}` });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
