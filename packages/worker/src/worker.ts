import type { JobName } from "@todolist/shared/schemas/webhook.schema";
import { run, type Task } from "graphile-worker";
import { processTaskScored } from "./tasks/processTaskScored.js";

const TASK_LIST: Record<JobName, Task> = {
  task_scored: processTaskScored,
};

const runner = await run({
  connectionString: process.env.DATABASE_URL,
  concurrency: 3,
  taskList: TASK_LIST,
});

async function gracefulShutdown() {
  await runner.stop();
  process.exit(0);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

await runner.promise;
