import { z } from "zod";

export const TodoDTOSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  dueDate: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});

export type TodoDTO = z.infer<typeof TodoDTOSchema>;

export const CreateTodoSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(500, "Title too long"),
  dueDate: z.iso.datetime().nullable().optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;

export const UpdateTodoSchema = CreateTodoSchema.partial().extend({
  completed: z.boolean().optional(),
});

export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
