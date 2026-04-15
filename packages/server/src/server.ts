import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./infra/db.js";

try {
  await prisma.$queryRaw`SELECT 1`;
  app.log.info("Database connection established");
} catch (err) {
  app.log.error(err, "Failed to connect to database");
  process.exit(1);
}

app.listen({ port: env.PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
