export const config = {
  runtime: "nodejs",
};

export default function handler(req, res) {
  if (req.method === "POST") {
    res.status(200).json({ message: `Hello world` });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
