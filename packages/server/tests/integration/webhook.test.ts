import { prisma } from "@todolist/shared/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import {
  createTestTodo,
  createTestTodoList,
  createTestUser,
} from "../fixtures.js";

describe("POST /wh/task-scored", () => {
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    app = buildApp();
    await prisma.$connect();
    await app.ready();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it("saves a WebhookEvent and enqueues a task_scored job atomically", async () => {
    const user = await createTestUser();
    const list = await createTestTodoList(user.id);
    const todo = await createTestTodo(list.id);

    const response = await app.inject({
      method: "POST",
      url: "/wh/task-scored",
      payload: { taskId: todo.id, points: 10 },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ received: true });

    const [event] = await prisma.webhookEvent.findMany({
      where: {
        type: "task.scored",
        payload: { path: ["taskId"], equals: todo.id },
      },
    });
    expect(event).toBeDefined();
    expect(event.payload).toMatchObject({ taskId: todo.id, points: 10 });

    const jobs = await prisma.$queryRaw<{ task_identifier: string }[]>`
      SELECT task_identifier FROM graphile_worker.jobs
      WHERE task_identifier = 'task_scored'
    `;
    expect(jobs).toHaveLength(1);
  });

  it("returns 400 for an invalid payload", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/wh/task-scored",
      payload: { taskId: "abc", points: -5 },
    });

    expect(response.statusCode).toBe(400);
  });
});
