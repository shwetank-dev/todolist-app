import { execSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

export async function setup() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
  execSync(
    "pnpm --filter @todolist/shared exec prisma migrate deploy --config prisma.config.ts",
    { stdio: "inherit" },
  );
}

export async function teardown() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Attempting to truncated table not in TEST environment");
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(`TRUNCATE TABLE todos, todo_lists, refresh_tokens,
   users RESTART IDENTITY CASCADE`);
  await client.end();
}
