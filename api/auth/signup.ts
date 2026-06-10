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
    const name = body.name ? String(body.name).trim() : null;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    const users = await sql`
      INSERT INTO users ${sql({
        id: userId,
        email,
        password_hash: passwordHash,
        name,
        role: "user",
      })}
      RETURNING id, email, name, role, created_at
    `;

    const user = users[0];

    await createSession(user.id, res);

    return res.status(201).json({ user });
  } catch (error: any) {
    console.error("Signup error:", error);

    return res.status(500).json({
      error: "Signup failed",
      detail: error?.message || String(error),
    });
  }
}