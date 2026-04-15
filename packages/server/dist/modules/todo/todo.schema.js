import z from "zod";
export const TodoResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});
