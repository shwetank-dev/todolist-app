import z from "zod";

export const UserDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
  lastLoginAt: z.string().nullable(),
});
