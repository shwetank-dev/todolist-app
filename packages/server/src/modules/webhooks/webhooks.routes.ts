import {
  type TaskScoredWebhook,
  TaskScoredWebhookSchema,
} from "@todolist/shared/schemas/webhook.schema";
import type { FastifyPluginAsync } from "fastify";
import { handleTaskScored } from "./webhooks.controller.js";

export const webhookRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/task-scored",
    { schema: { body: TaskScoredWebhookSchema } },
    async (request, reply) => {
      await handleTaskScored(request.body as TaskScoredWebhook);
      return reply.status(200).send({ received: true });
    },
  );
};
