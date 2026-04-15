import type { FastifyPluginAsync } from "fastify";
import { TodoResponseSchema } from "./todo.schema.js";

export const todoRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/todos", async (_request, _response) => {
    return { todos: [] };
  });

  fastify.get(
    "/todos/:id",
    {
      schema: {
        response: {
          200: TodoResponseSchema.toJSONSchema(),
        },
      },
    },
    async (_request, _response) => {
      return { id: 1, name: "name", extra: "extra" };
    },
  );
};
