import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { cache } from "./infra/cache.js";
import { prisma } from "./infra/db.js";

const app = buildApp({ logger: true });

try {
  await prisma.$queryRaw`SELECT 1`;
  app.log.info("Database connection established");
} catch (err) {
  app.log.error(err, "Failed to connect to database");
  process.exit(1);
}

try {
  await cache.ping();
  app.log.info("Redis connection established");
} catch (err) {
  app.log.error(err, "Failed to connect to redis");
  process.exit(1);
}

app.listen({ port: env.PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
