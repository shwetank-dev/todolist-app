import { z } from "zod";

export const CategoryDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type CategoryDTO = z.infer<typeof CategoryDTOSchema>;

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
