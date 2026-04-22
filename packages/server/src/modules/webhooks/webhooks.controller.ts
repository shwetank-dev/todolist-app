import { prisma } from "@todolist/shared/db";
import type { TaskScoredWebhook } from "@todolist/shared/schemas/webhook.schema";
import { enqueueJob } from "../../infra/jobs.js";

export async function handleTaskScored(body: TaskScoredWebhook) {
  await prisma.$transaction(async (tx) => {
    const event = await tx.webhookEvent.create({
      data: { type: "task.scored", payload: body },
    });
    await enqueueJob(tx, "task_scored", { webhookEventId: event.id });
  });
}
