import { execSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

async function truncateAll(client: pg.Client) {
  await client.query(`TRUNCATE TABLE todos, todo_lists, refresh_tokens,
   users, webhook_events, point_deltas RESTART IDENTITY CASCADE`);
  await client.query("DELETE FROM graphile_worker._private_jobs");
}

export async function setup() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
  execSync(
    "pnpm --filter @todolist/shared exec prisma migrate deploy --config prisma.config.ts",
    { stdio: "inherit" },
  );
  execSync(
    "pnpm --filter @todolist/worker exec graphile-worker --schema-only",
    { stdio: "inherit" },
  );
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await truncateAll(client);
  await client.end();
}

export async function teardown() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Attempting to truncate tables not in TEST environment");
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await truncateAll(client);
  await client.end();
}
