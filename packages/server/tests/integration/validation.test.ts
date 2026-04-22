import { prisma } from "@todolist/shared/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import {
  cleanupUser,
  createTestTodoList,
  createTestUser,
  generateTestEmail,
  loginTestUser,
} from "../fixtures.js";

describe("validation and error paths", () => {
  let app: ReturnType<typeof buildApp>;
  let accessToken: string;
  let user1Email: string;
  let user2Email: string;
  let todoListId: string;

  beforeAll(async () => {
    app = buildApp();
    await prisma.$connect();
    await app.ready();

    user1Email = generateTestEmail();
    user2Email = generateTestEmail();

    const user1 = await createTestUser(user1Email);
    await createTestUser(user2Email);

    accessToken = await loginTestUser(app, user1Email);
    const list = await createTestTodoList(user1.id);
    todoListId = list.id;
  });

  afterAll(async () => {
    await cleanupUser(user1Email);
    await cleanupUser(user2Email);
    await prisma.$disconnect();
    await app.close();
  });

  it("POST /api/v1/todolists missing name -> 400 VALIDATION_ERROR", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/todolists",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toBeInstanceOf(Array);
    expect(body.error.details.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/todolists/:id non-existent id -> 404 NOT_FOUND", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/todolists/nonexistent-id",
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: { code: "NOT_FOUND", message: expect.any(String) },
    });
  });

  it("PATCH /api/v1/todolists/:id by non-owner -> 403 FORBIDDEN", async () => {
    const user2Token = await loginTestUser(app, user2Email);

    const response = await app.inject({
      method: "PATCH",
      url: `/api/v1/todolists/${todoListId}`,
      headers: { authorization: `Bearer ${user2Token}` },
      payload: { name: "Hacked" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: { code: "FORBIDDEN", message: expect.any(String) },
    });
  });

  it("GET /api/v1/todolists/:id/todos with invalid limit -> 400 VALIDATION_ERROR", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/v1/todolists/${todoListId}/todos?limit=abc`,
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toBeInstanceOf(Array);
    expect(body.error.details.length).toBeGreaterThan(0);
  });
});
