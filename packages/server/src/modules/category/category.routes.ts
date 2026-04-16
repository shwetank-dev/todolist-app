import {
  type CategoryDTO,
  CategoryDTOSchema,
  type CreateCategoryInput,
  CreateCategorySchema,
} from "@todolist/shared/schemas/category.schema";
import {
  type PaginatedResponse,
  PaginatedResponseSchema,
} from "@todolist/shared/schemas/pagination.schema";
import type { FastifyPluginAsync } from "fastify";
import { toSchema } from "../../shared/schema.js";

const mockCategories: CategoryDTO[] = [
  { id: "1", name: "Work" },
  { id: "2", name: "Personal" },
];

export const categoryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Reply: { 200: PaginatedResponse<CategoryDTO> } }>(
    "/categories",
    {
      schema: {
        response: {
          200: toSchema(PaginatedResponseSchema(CategoryDTOSchema)),
        },
      },
    },
    async (_request, _reply) => {
      return { data: mockCategories, nextCursor: null };
    },
  );

  fastify.post<{ Body: CreateCategoryInput; Reply: { 201: CategoryDTO } }>(
    "/categories",
    {
      schema: {
        body: toSchema(CreateCategorySchema),
        response: {
          201: toSchema(CategoryDTOSchema),
        },
      },
    },
    async (request, reply) => {
      const newCategory: CategoryDTO = {
        id: crypto.randomUUID(),
        name: request.body.name,
      };
      reply.status(201).send(newCategory);
    },
  );
};
