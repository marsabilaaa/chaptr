const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const sql = postgres(process.env.DATABASE_URL);
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;
    await sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        theme_id text NOT NULL DEFAULT 'default',
        custom_theme jsonb,
        mode text NOT NULL DEFAULT 'system',
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `;
    console.log("user_preferences table ensured");
  } catch (e) {
    console.error("failed:", e);
    process.exit(1);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
