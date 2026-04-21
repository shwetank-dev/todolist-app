import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { prisma } from "../../src/infra/db.js";
import {
  cleanupUser,
  createTestTodo,
  createTestTodoList,
  createTestUser,
  loginTestUser,
} from "../fixtures.js";

describe("todo pagination", () => {
  let app: ReturnType<typeof buildApp>;
  let token: string;
  let listId: string;
  let userEmail: string;

  beforeAll(async () => {
    app = buildApp();
    await prisma.$connect();
    await app.ready();

    const user = await createTestUser();
    userEmail = user.email;
    token = await loginTestUser(app, user.email);
    const list = await createTestTodoList(user.id, "Pagination Test List");
    listId = list.id;

    // Seed 5 todos with staggered createdAt so ordering is deterministic
    for (let i = 1; i <= 5; i++) {
      await createTestTodo(listId, `Todo ${i}`, new Date(2024, 0, i));
    }
  });

  afterAll(async () => {
    await cleanupUser(userEmail);
    await prisma.$disconnect();
    await app.close();
  });

  it("limit=3 returns 3 todos and a nextCursor", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/v1/todolists/${listId}/todos?limit=3`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode, `body: ${response.body}`).toBe(200);
    const body = response.json();
    expect(body.data).toHaveLength(3);
    expect(body.nextCursor).not.toBeNull();
  });

  it("following the nextCursor returns the remaining 2 todos and no nextCursor", async () => {
    const first = await app.inject({
      method: "GET",
      url: `/api/v1/todolists/${listId}/todos?limit=3`,
      headers: { authorization: `Bearer ${token}` },
    });
    const { nextCursor } = first.json();

    const second = await app.inject({
      method: "GET",
      url: `/api/v1/todolists/${listId}/todos?limit=3&cursor=${nextCursor}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(second.statusCode).toBe(200);
    const body = second.json();
    expect(body.data).toHaveLength(2);
    expect(body.nextCursor).toBeNull();
  });

  it("limit=10 on a 5-todo list returns all 5 and no nextCursor", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/v1/todolists/${listId}/todos?limit=10`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data).toHaveLength(5);
    expect(body.nextCursor).toBeNull();
  });
});
