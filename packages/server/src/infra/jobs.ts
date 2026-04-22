import type { Prisma } from "@todolist/shared/client";
import type {
  JobName,
  JobPayload,
} from "@todolist/shared/schemas/webhook.schema";

export async function enqueueJob<T extends JobName>(
  tx: Prisma.TransactionClient,
  jobName: T,
  payload: JobPayload<T>,
) {
  await tx.$executeRaw`
    SELECT graphile_worker.add_job(${jobName}, ${JSON.stringify(payload)}::json)
  `;
}
