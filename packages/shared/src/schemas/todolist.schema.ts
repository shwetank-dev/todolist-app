import { z } from "zod";
import { TodoDTOSchema } from "./todo.schema.js";

export const TodoListSummaryDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  todoCount: z.number(),
  createdAt: z.iso.datetime(),
});

export type TodoListSummaryDTO = z.infer<typeof TodoListSummaryDTOSchema>;

export const TodoListDetailDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.iso.datetime(),
  todos: z.array(TodoDTOSchema),
});

export type TodoListDetailDTO = z.infer<typeof TodoListDetailDTOSchema>;

export const CreateTodoListSchema = z.object({
  name: z.string().min(1).max(255),
});

export type CreateTodoListInput = z.infer<typeof CreateTodoListSchema>;

export const UpdateTodoListSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export type UpdateTodoListInput = z.infer<typeof UpdateTodoListSchema>;
