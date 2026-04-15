import type { FastifyPluginAsync } from "fastify";
import z from "zod";

const HealthResponseSchema = z.object({
  status: z.string(),
});

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/health",
    {
      schema: {
        response: {
          200: HealthResponseSchema.toJSONSchema(),
        },
      },
    },
    async (_req, _res) => {
      return { status: "ok" };
    },
  );
};
