import bcrypt from "bcryptjs";
import postgres from "postgres";
import crypto from "crypto";
import { serialize } from "cookie";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL or POSTGRES_URL");
}

const sql = postgres(connectionString, {
  ssl: "require",
});

const COOKIE_NAME = "capsule_session";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function createSession(userId: string, res: any) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const sessionId = crypto.randomUUID();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await sql`
    INSERT INTO sessions ${sql({
      id: sessionId,
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })}
  `;

  res.setHeader(
    "Set-Cookie",
    serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    })
  );
}

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
      detail: error?.message || String(error),
    });
  }
}
