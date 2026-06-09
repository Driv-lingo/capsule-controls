import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL or POSTGRES_URL");
}

export const sql = postgres(connectionString, {
  ssl: "require",
});
