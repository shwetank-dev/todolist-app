import {
  type CreateUserInput,
  CreateUserSchema,
  type UpdateUserInput,
  UpdateUserSchema,
  type UserDTO,
  UserDTOSchema,
} from "@todolist/shared/schemas/user.schema";
import type { FastifyPluginAsync } from "fastify";
import { toSchema } from "../../shared/schema.js";

const mockUser: UserDTO = {
  id: "1",
  name: "Jane Doe",
  email: "jane@example.com",
  createdAt: new Date().toISOString(),
  lastLoginAt: null,
};

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: CreateUserInput; Reply: { 201: UserDTO } }>(
    "/users",
    {
      schema: {
        body: toSchema(CreateUserSchema),
        response: { 201: toSchema(UserDTOSchema) },
      },
    },
    async (request, reply) => {
      const user: UserDTO = {
        id: crypto.randomUUID(),
        name: request.body.name,
        email: request.body.email,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
      };
      reply.status(201).send(user);
    },
  );

  fastify.get<{ Reply: { 200: UserDTO } }>(
    "/users/me",
    {
      schema: {
        response: { 200: toSchema(UserDTOSchema) },
      },
    },
    async (_request, _reply) => {
      return mockUser;
    },
  );

  fastify.patch<{ Body: UpdateUserInput; Reply: { 200: UserDTO } }>(
    "/users/me",
    {
      schema: {
        body: toSchema(UpdateUserSchema),
        response: { 200: toSchema(UserDTOSchema) },
      },
    },
    async (request, _reply) => {
      return { ...mockUser, ...request.body };
    },
  );

  fastify.delete("/users/me", async (_request, reply) => {
    reply.status(204).send();
  });
};
