import {
  type PaginatedResponse,
  PaginatedResponseSchema,
} from "@todolist/shared/schemas/pagination.schema";
import {
  type TodoListSummaryDTO,
  TodoListSummaryDTOSchema,
} from "@todolist/shared/schemas/todolist.schema";
import type { FastifyPluginAsync } from "fastify";
import { toSchema } from "../../shared/schema.js";

export const feedRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Reply: { 200: PaginatedResponse<TodoListSummaryDTO> } }>(
    "/feed",
    {
      schema: {
        response: {
          200: toSchema(PaginatedResponseSchema(TodoListSummaryDTOSchema)),
        },
      },
    },
    async (_request, _reply) => {
      return { data: [], nextCursor: null };
    },
  );
};
