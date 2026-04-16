import { z } from "zod";
import { CategoryDTOSchema } from "./category.schema.js";
import { UserSummaryDTOSchema } from "./user.schema.js";

export const TodoListSummaryDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  isPublic: z.boolean(),
  todoCount: z.number(),
  createdBy: UserSummaryDTOSchema,
  createdAt: z.iso.datetime(),
});

export type TodoListSummaryDTO = z.infer<typeof TodoListSummaryDTOSchema>;

export const TodoListDetailDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  isPublic: z.boolean(),
  createdBy: UserSummaryDTOSchema,
  createdAt: z.iso.datetime(),
  todos: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean(),
    }),
  ),
  collaborators: z.array(UserSummaryDTOSchema),
  categories: z.array(CategoryDTOSchema),
});

export type TodoListDetailDTO = z.infer<typeof TodoListDetailDTOSchema>;

export const CreateTodoListSchema = z.object({
  name: z.string().min(1).max(255),
  isPublic: z.boolean().default(false),
});

export type CreateTodoListInput = z.infer<typeof CreateTodoListSchema>;

export const UpdateTodoListSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateTodoListInput = z.infer<typeof UpdateTodoListSchema>;
