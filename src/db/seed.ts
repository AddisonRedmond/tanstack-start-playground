import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { seed } from "drizzle-seed";
import { todos } from "./schema";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  await seed(db, { todos });
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
