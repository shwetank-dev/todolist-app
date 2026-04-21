import {
  type PaginatedResponse,
  PaginatedResponseSchema,
  type PaginationQuery,
  PaginationQuerySchema,
} from "@todolist/shared/schemas/pagination.schema";
import {
  type CreateTodoInput,
  CreateTodoSchema,
  type TodoDTO,
  TodoDTOSchema,
  type UpdateTodoInput,
  UpdateTodoSchema,
} from "@todolist/shared/schemas/todo.schema";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import {
  createTodo,
  deleteTodo,
  getTodo,
  getTodosForList,
  updateTodo,
} from "./todo.controller.js";

export const todoRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Params: { id: string };
    Querystring: PaginationQuery;
    Reply: { 200: PaginatedResponse<TodoDTO> };
  }>(
    "/todolists/:id/todos",
    {
      schema: {
        params: z.object({ id: z.string() }),
        querystring: PaginationQuerySchema,
        response: { 200: PaginatedResponseSchema(TodoDTOSchema) },
      },
    },
    async (request) => {
      return getTodosForList(
        request.params.id,
        // biome-ignore lint/style/noNonNullAssertion: requireAuth guarantees user is set
        request.user!.id,
        request.query.cursor,
        request.query.limit,
      );
    },
  );

  fastify.post<{
    Params: { id: string };
    Body: CreateTodoInput;
    Reply: { 201: TodoDTO };
  }>(
    "/todolists/:id/todos",
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: CreateTodoSchema,
        response: { 201: TodoDTOSchema },
      },
    },
    async (request, reply) => {
      const todo = await createTodo(
        request.params.id,
        request.body,
        // biome-ignore lint/style/noNonNullAssertion: <user authenticated>
        request.user!.id,
      );
      reply.status(201).send(todo);
    },
  );

  fastify.get<{
    Params: { id: string; todoId: string };
    Reply: { 200: TodoDTO };
  }>(
    "/todolists/:id/todos/:todoId",
    {
      schema: {
        params: z.object({ id: z.string(), todoId: z.string() }),
        response: { 200: TodoDTOSchema },
      },
    },
    async (request) => {
      // biome-ignore lint/style/noNonNullAssertion: requireAuth guarantees user is set
      return getTodo(request.params.todoId, request.user!.id);
    },
  );

  fastify.patch<{
    Params: { id: string; todoId: string };
    Body: UpdateTodoInput;
    Reply: { 200: TodoDTO };
  }>(
    "/todolists/:id/todos/:todoId",
    {
      schema: {
        params: z.object({ id: z.string(), todoId: z.string() }),
        body: UpdateTodoSchema,
        response: { 200: TodoDTOSchema },
      },
    },
    async (request) => {
      // biome-ignore lint/style/noNonNullAssertion: requireAuth guarantees user is set
      return updateTodo(request.params.todoId, request.body, request.user!.id);
    },
  );

  fastify.delete<{ Params: { id: string; todoId: string } }>(
    "/todolists/:id/todos/:todoId",
    {
      schema: {
        params: z.object({ id: z.string(), todoId: z.string() }),
      },
    },
    async (request, reply) => {
      // biome-ignore lint/style/noNonNullAssertion: requireAuth guarantees user is set
      await deleteTodo(request.params.todoId, request.user!.id);
      reply.status(204).send();
    },
  );
};
