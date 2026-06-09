import bcrypt from "bcryptjs";
import { sql } from "../_db";
import { createSession } from "../_auth";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const users = await sql`
      SELECT id, email, name, role, password_hash, created_at
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    if (!user.password_hash) {
      console.error("Login error: user exists but password_hash is missing");
      return res.status(500).json({
        error: "Account exists but password login is not configured correctly",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    await createSession(user.id, res);

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: "Login failed",
      detail:
        process.env.NODE_ENV === "production"
          ? undefined
          : error?.message || String(error),
    });
  }
}
