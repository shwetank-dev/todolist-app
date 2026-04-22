import { z } from "zod";

// Incoming webhook body schemas (validated at the endpoint)
export const TaskScoredWebhookSchema = z.object({
  taskId: z.string(),
  points: z.number().int().positive(),
});

export type TaskScoredWebhook = z.infer<typeof TaskScoredWebhookSchema>;

// Job payload schemas (what gets enqueued — always a pointer to the stored event)
export const TaskScoredJobPayloadSchema = z.object({
  webhookEventId: z.string(),
});

export const JobPayloadSchemas = {
  task_scored: TaskScoredJobPayloadSchema,
} as const;

export const JobNameSchema = z.enum(
  Object.keys(JobPayloadSchemas) as [keyof typeof JobPayloadSchemas],
);

export type JobName = z.infer<typeof JobNameSchema>;

export type JobPayload<T extends JobName> = z.infer<
  (typeof JobPayloadSchemas)[T]
>;
