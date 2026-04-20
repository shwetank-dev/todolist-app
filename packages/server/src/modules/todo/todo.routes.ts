import {
  type PaginatedResponse,
  PaginatedResponseSchema,
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
import { toSchema } from "../../shared/schema.js";
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
    Reply: { 200: PaginatedResponse<TodoDTO> };
  }>(
    "/todolists/:id/todos",
    {
      schema: {
        response: { 200: toSchema(PaginatedResponseSchema(TodoDTOSchema)) },
      },
    },
    async (request) => {
      // biome-ignore lint/style/noNonNullAssertion: requireAuth guarantees user is set
      return getTodosForList(request.params.id, request.user!.id);
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
        body: toSchema(CreateTodoSchema),
        response: { 201: toSchema(TodoDTOSchema) },
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
    { schema: { response: { 200: toSchema(TodoDTOSchema) } } },
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
        body: toSchema(UpdateTodoSchema),
        response: { 200: toSchema(TodoDTOSchema) },
      },
    },
    async (request) => {
      // biome-ignore lint/style/noNonNullAssertion: requireAuth guarantees user is set
      return updateTodo(request.params.todoId, request.body, request.user!.id);
    },
  );

  fastify.delete<{ Params: { id: string; todoId: string } }>(
    "/todolists/:id/todos/:todoId",
    async (request, reply) => {
      // biome-ignore lint/style/noNonNullAssertion: requireAuth guarantees user is set
      await deleteTodo(request.params.todoId, request.user!.id);
      reply.status(204).send();
    },
  );
};
