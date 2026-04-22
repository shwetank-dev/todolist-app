import { prisma } from "@todolist/shared/db";
import { TaskScoredWebhookSchema } from "@todolist/shared/schemas/webhook.schema";
import type { Task } from "graphile-worker";

export const processTaskScored: Task = async (payload) => {
  const { webhookEventId } = payload as { webhookEventId: string };

  const event = await prisma.webhookEvent.findUniqueOrThrow({
    where: { id: webhookEventId },
  });

  const { taskId, points } = TaskScoredWebhookSchema.parse(event.payload);

  const result = await prisma.$executeRaw`
    INSERT INTO point_deltas (id, user_id, task_id, points, created_at)
    SELECT gen_random_uuid(), tl.owner_id, ${taskId}, ${points}, NOW()
    FROM todos t
    JOIN todo_lists tl ON tl.id = t.list_id
    WHERE t.id = ${taskId}
    ON CONFLICT (user_id, task_id) DO NOTHING
  `;

  console.log(
    `task_scored: created ${result} point deltas for taskId=${taskId}`,
  );
};
