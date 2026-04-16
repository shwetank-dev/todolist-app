import type { ZodType } from "zod";

// Zod v4 outputs JSON Schema draft 2020-12 which Fastify's Ajv doesn't support.
// Stripping $schema makes Ajv fall back to its default draft (2019-09), which works.
export function toSchema(zodSchema: ZodType): object {
  const { $schema, ...rest } = zodSchema.toJSONSchema() as Record<
    string,
    unknown
  >;
  return rest;
}
