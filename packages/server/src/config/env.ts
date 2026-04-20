import z from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  PORT: z.coerce.number().int().positive(),
  NODE_ENV: z.enum(["development", "production", "test"]),
  JWT_SECRET: z.string(),
});

export const env = EnvSchema.parse(process.env);
