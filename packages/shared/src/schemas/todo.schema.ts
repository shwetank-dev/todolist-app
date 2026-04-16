import { z } from "zod";
import { CategoryDTOSchema } from "./category.schema.js";
import { UserSummaryDTOSchema } from "./user.schema.js";

export const TodoDTOSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  dueDate: z.iso.datetime().nullable(),
  assignedTo: UserSummaryDTOSchema.nullable(),
  category: CategoryDTOSchema.nullable(),
  createdAt: z.iso.datetime(),
});

export type TodoDTO = z.infer<typeof TodoDTOSchema>;

export const CreateTodoSchema = z.object({
  title: z.string().min(1).max(500),
  dueDate: z.iso.datetime().nullable().optional(),
  assignedTo: z.string().optional(), // userId
  categoryId: z.string().optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;

export const UpdateTodoSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
  dueDate: z.iso.datetime().nullable().optional(),
  assignedTo: z.string().nullable().optional(), // userId, null to unassign
  categoryId: z.string().nullable().optional(), // null to remove category
});

export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
