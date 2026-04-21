import {
  // type UpdateUserInput,
  // UpdateUserSchema,
  type UserDTO,
  UserDTOSchema,
} from "@todolist/shared/schemas/user.schema";
import type { FastifyPluginAsync } from "fastify";
import { getMe } from "./user.controller.js";

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Reply: { 200: UserDTO } }>(
    "/users/me",
    {
      schema: {
        response: { 200: UserDTOSchema },
      },
    },
    async (request, reply) => {
      // biome-ignore lint/style/noNonNullAssertion: <Authenticated route>
      const userEmail = request.user!.email;
      const userResponse = await getMe(userEmail);
      reply.status(200).send(userResponse);
    },
  );

  // fastify.patch<{ Body: UpdateUserInput; Reply: { 200: UserDTO } }>(
  //   "/users/me",
  //   {
  //     schema: {
  //       body: toSchema(UpdateUserSchema),
  //       response: { 200: toSchema(UserDTOSchema) },
  //     },
  //   },
  //   async (request, _reply) => {
  //     return getMe(request.user!.email);
  //   },
  // );

  // fastify.delete("/users/me", async (_request, reply) => {
  //   reply.status(204).send();
  // });
};
