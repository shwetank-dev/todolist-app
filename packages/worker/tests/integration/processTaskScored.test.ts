import { prisma } from "@todolist/shared/db";
import type { JobHelpers } from "graphile-worker";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { processTaskScored } from "../../src/tasks/processTaskScored.js";

const helpers = {} as JobHelpers;

describe("processTaskScored", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a point delta for every user who owns the todo", async () => {
    const user = await prisma.user.create({
      data: {
        email: "worker-test@example.com",
        name: "Test",
        passwordHash: "x",
      },
    });
    const list = await prisma.todoList.create({
      data: { title: "Test List", ownerId: user.id },
    });
    const todo = await prisma.todo.create({
      data: { title: "Test Todo", listId: list.id },
    });
    const event = await prisma.webhookEvent.create({
      data: { type: "task.scored", payload: { taskId: todo.id, points: 10 } },
    });

    await processTaskScored({ webhookEventId: event.id }, helpers);

    const deltas = await prisma.pointDelta.findMany({
      where: { taskId: todo.id },
    });
    expect(deltas).toHaveLength(1);
    expect(deltas[0].userId).toBe(user.id);
    expect(deltas[0].points).toBe(10);
  });

  it("is idempotent — retrying does not double the deltas", async () => {
    const user = await prisma.user.create({
      data: {
        email: "worker-idempotent@example.com",
        name: "Test",
        passwordHash: "x",
      },
    });
    const list = await prisma.todoList.create({
      data: { title: "Test List", ownerId: user.id },
    });
    const todo = await prisma.todo.create({
      data: { title: "Test Todo", listId: list.id },
    });
    const event = await prisma.webhookEvent.create({
      data: { type: "task.scored", payload: { taskId: todo.id, points: 10 } },
    });

    await processTaskScored({ webhookEventId: event.id }, helpers);
    await processTaskScored({ webhookEventId: event.id }, helpers);

    const deltas = await prisma.pointDelta.findMany({
      where: { taskId: todo.id },
    });
    expect(deltas).toHaveLength(1);
  });
});
