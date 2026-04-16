import {
  type PaginatedResponse,
  PaginatedResponseSchema,
} from "@todolist/shared/schemas/pagination.schema";
import {
  type UserSummaryDTO,
  UserSummaryDTOSchema,
} from "@todolist/shared/schemas/user.schema";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { toSchema } from "../../shared/schema.js";

const FollowBodySchema = z.object({
  userId: z.string(),
});

type FollowBody = z.infer<typeof FollowBodySchema>;

export const followRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Reply: { 200: PaginatedResponse<UserSummaryDTO> } }>(
    "/users/me/follows",
    {
      schema: {
        response: {
          200: toSchema(PaginatedResponseSchema(UserSummaryDTOSchema)),
        },
      },
    },
    async (_request, _reply) => {
      return { data: [], nextCursor: null };
    },
  );

  fastify.post<{ Body: FollowBody; Reply: { 201: UserSummaryDTO } }>(
    "/follows",
    {
      schema: {
        body: toSchema(FollowBodySchema),
        response: { 201: toSchema(UserSummaryDTOSchema) },
      },
    },
    async (request, reply) => {
      const followed: UserSummaryDTO = {
        id: request.body.userId,
        name: "Some User",
      };
      reply.status(201).send(followed);
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    "/follows/:id",
    async (_request, reply) => {
      reply.status(204).send();
    },
  );
};
