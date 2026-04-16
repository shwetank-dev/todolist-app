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

const mockTodo: TodoDTO = {
  id: "1",
  title: "Buy groceries",
  completed: false,
  dueDate: null,
  assignedTo: null,
  category: null,
  createdAt: new Date().toISOString(),
};

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
    async (_request, _reply) => {
      return { data: [mockTodo], nextCursor: null };
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
      const todo: TodoDTO = {
        id: crypto.randomUUID(),
        title: request.body.title,
        completed: false,
        dueDate: request.body.dueDate ?? null,
        assignedTo: null,
        category: null,
        createdAt: new Date().toISOString(),
      };
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
        response: { 200: toSchema(TodoDTOSchema) },
      },
    },
    async (_request, _reply) => {
      return mockTodo;
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
    async (_request, _reply) => {
      return mockTodo;
    },
  );

  fastify.delete<{ Params: { id: string; todoId: string } }>(
    "/todolists/:id/todos/:todoId",
    async (_request, reply) => {
      reply.status(204).send();
    },
  );
};
