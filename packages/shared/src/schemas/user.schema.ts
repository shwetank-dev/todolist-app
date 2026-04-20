import { z } from "zod";

export const UserSummaryDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type UserSummaryDTO = z.infer<typeof UserSummaryDTOSchema>;

export const UserDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.iso.datetime(),
  lastLoginAt: z.iso.datetime().nullable(),
});

export type UserDTO = z.infer<typeof UserDTOSchema>;

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(8).max(100),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.email(),
  password: z.string().min(8).max(100).optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
});

export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const CreateUserResponseSchema = z.object({
  user: UserDTOSchema,
  tokens: AuthTokensSchema,
});

export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
