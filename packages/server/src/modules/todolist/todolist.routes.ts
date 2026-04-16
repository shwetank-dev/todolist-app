import {
  type PaginatedResponse,
  PaginatedResponseSchema,
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

const mockList: TodoListDetailDTO = {
  id: "1",
  name: "My List",
  isPublic: false,
  createdBy: { id: "1", name: "Jane Doe" },
  createdAt: new Date().toISOString(),
  todos: [],
  collaborators: [],
  categories: [],
};

const mockSummary: TodoListSummaryDTO = {
  id: "1",
  name: "My List",
  isPublic: false,
  todoCount: 0,
  createdBy: { id: "1", name: "Jane Doe" },
  createdAt: new Date().toISOString(),
};

export const todoListRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Reply: { 200: PaginatedResponse<TodoListSummaryDTO> } }>(
    "/todolists",
    {
      schema: {
        response: {
          200: toSchema(PaginatedResponseSchema(TodoListSummaryDTOSchema)),
        },
      },
    },
    async (_request, _reply) => {
      return { data: [mockSummary], nextCursor: null };
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
      const list: TodoListDetailDTO = {
        id: crypto.randomUUID(),
        name: request.body.name,
        isPublic: request.body.isPublic ?? false,
        createdBy: { id: "1", name: "Jane Doe" },
        createdAt: new Date().toISOString(),
        todos: [],
        collaborators: [],
        categories: [],
      };
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
    async (_request, _reply) => {
      return mockList;
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
    async (request, _reply) => {
      return { ...mockList, ...request.body };
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    "/todolists/:id",
    async (_request, reply) => {
      reply.status(204).send();
    },
  );
};
