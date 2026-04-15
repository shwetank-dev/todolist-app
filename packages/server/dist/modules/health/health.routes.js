import z from "zod";

const HealthResponseSchema = z.object({
  status: z.string(),
});
export const healthRoutes = async (fastify) => {
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
