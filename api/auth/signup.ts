export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({
    ok: true,
    user: {
      id: "debug-user",
      email: "debug@example.com",
      name: "Debug User",
      role: "user",
    },
  });
}
