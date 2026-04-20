import {
  type PaginatedResponse,
  PaginatedResponseSchema,
  type PaginationQuery,
  PaginationQuerySchema,
} from "@todolist/shared/schemas/pagination.schema";
import {
  type CreateTodoListInput,
  CreateTodoListSchema,
  type TodoListDetailDTO,
  TodoListDetailDTOSchema,
  type TodoListSummaryDTO,
  TodoListSummaryDTOSchema,
  type UpdateTodoListInput,
  UpdateTodoListSchema,
} from "@todolist/shared/schemas/todolist.schema";
import type { FastifyPluginAsync } from "fastify";
import { toSchema } from "../../shared/schema.js";
import {
  createTodoList,
  deleteTodoList,
  getTodoList,
  getTodoLists,
  updateTodoList,
} from "./todolist.controller.js";

export const todoListRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Querystring: PaginationQuery;
    Reply: { 200: PaginatedResponse<TodoListSummaryDTO> };
  }>(
    "/todolists",
    {
      schema: {
        querystring: toSchema(PaginationQuerySchema),
        response: {
          200: toSchema(PaginatedResponseSchema(TodoListSummaryDTOSchema)),
        },
      },
    },
    async (request) => {
      const { cursor, limit } = request.query;
      // biome-ignore lint/style/noNonNullAssertion: requireAuth guarantees user is set
      return getTodoLists(request.user!.id, cursor, limit);
    },
  );

  fastify.post<{
    Body: CreateTodoListInput;
    Reply: { 201: TodoListDetailDTO };
  }>(
    "/todolists",
    {
      schema: {
        body: toSchema(CreateTodoListSchema),
        response: { 201: toSchema(TodoListDetailDTOSchema) },
      },
    },
    async (request, reply) => {
      // biome-ignore lint/style/noNonNullAssertion: requireAuth guarantees user is set
      const list = await createTodoList(request.body, request.user!.id);
      reply.status(201).send(list);
    },
  );

  fastify.get<{ Params: { id: string }; Reply: { 200: TodoListDetailDTO } }>(
    "/todolists/:id",
    {
      schema: {
        response: { 200: toSchema(TodoListDetailDTOSchema) },
      },
    },
    async (request) => {
      // biome-ignore lint/style/noNonNullAssertion: requireAuth guarantees user is set
      return getTodoList(request.params.id, request.user!.id);
    },
  );

  fastify.patch<{
    Params: { id: string };
    Body: UpdateTodoListInput;
    Reply: { 200: TodoListDetailDTO };
  }>(
    "/todolists/:id",
    {
      schema: {
        body: toSchema(UpdateTodoListSchema),
        response: { 200: toSchema(TodoListDetailDTOSchema) },
      },
    },
    async (request) => {
      // biome-ignore lint/style/noNonNullAssertion: requireAuth guarantees user is set
      return updateTodoList(request.params.id, request.body, request.user!.id);
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    "/todolists/:id",
    {},
    async (request, reply) => {
      // biome-ignore lint/style/noNonNullAssertion: requireAuth guarantees user is set
      await deleteTodoList(request.params.id, request.user!.id);
      reply.status(204).send();
    },
  );
};
