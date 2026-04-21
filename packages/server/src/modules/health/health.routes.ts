import type { FastifyPluginAsync } from "fastify";
import z from "zod";
import { cache } from "../../infra/cache.js";
import { prisma } from "../../infra/db.js";

const HealthResponseSchema = z.object({
  status: z.string(),
  db: z.string(),
  redis: z.string(),
});

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/health",
    {
      schema: {
        response: {
          200: HealthResponseSchema.toJSONSchema(),
          503: HealthResponseSchema.toJSONSchema(),
        },
      },
    },
    async (_req, res) => {
      try {
        await prisma.$queryRaw`SELECT 1;`;
        await cache.ping();
      } catch (_err) {
        res.status(503);
        return { status: "error", db: "error" };
      }
      return { status: "ok", db: "ok", redis: "ok" };
    },
  );
};
