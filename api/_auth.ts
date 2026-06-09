import crypto from "crypto";
import { serialize, parse } from "cookie";
import { sql } from "./_db.js";

const COOKIE_NAME = "capsule_session";

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, res: any) {
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

export async function getCurrentUser(req: any) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];

  if (!token) return null;

  const tokenHash = hashToken(token);

  const users = await sql`
    SELECT users.id, users.email, users.name, users.role, users.created_at
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ${tokenHash}
    AND sessions.expires_at > NOW()
    LIMIT 1
  `;

  return users[0] || null;
}

export async function clearSession(req: any, res: any) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];

  if (token) {
    const tokenHash = hashToken(token);
    await sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
  }

  res.setHeader(
    "Set-Cookie",
    serialize(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
  );
}
