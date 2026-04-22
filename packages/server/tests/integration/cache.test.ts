import { prisma } from "@todolist/shared/db";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { buildApp } from "../../src/app.js";
import { cache } from "../../src/infra/cache.js";
import { cleanupUser, createTestUser, loginTestUser } from "../fixtures.js";

describe("caching", () => {
  let app: ReturnType<typeof buildApp>;
  let token: string;
  let userId: string;
  let userEmail: string;

  beforeAll(async () => {
    app = buildApp();
    await prisma.$connect();
    await app.ready();

    const user = await createTestUser();
    userEmail = user.email;
    userId = user.id;
    token = await loginTestUser(app, user.email);
  });

  beforeEach(async () => {
    await cache.del(`todolist-app:todolists:${userId}`);
  });

  afterAll(async () => {
    await cleanupUser(userEmail);
    await prisma.$disconnect();
    await app.close();
  });

  it("second GET /todolists request is served from cache", async () => {
    const spy = vi.spyOn(prisma.todoList, "findMany");

    await app.inject({
      method: "GET",
      url: "/api/v1/todolists",
      headers: { authorization: `Bearer ${token}` },
    });

    await app.inject({
      method: "GET",
      url: "/api/v1/todolists",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("creating a list invalidates the cache", async () => {
    await app.inject({
      method: "GET",
      url: "/api/v1/todolists",
      headers: { authorization: `Bearer ${token}` },
    });

    await app.inject({
      method: "POST",
      url: "/api/v1/todolists",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "New List" },
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/todolists",
      headers: { authorization: `Bearer ${token}` },
    });

    const body = response.json();
    expect(body.data.some((l: { name: string }) => l.name === "New List")).toBe(
      true,
    );
  });
});
