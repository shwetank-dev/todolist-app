import { z } from "zod";

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    data: z.array(itemSchema),
    nextCursor: z.string().nullable(),
  });

export type PaginatedResponse<T> = {
  data: T[];
  nextCursor: string | null;
};

export const PaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
