import { prisma } from "@todolist/shared/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";

const TEST_EMAIL = `auth-test-${Math.floor(Math.random() * 1000)}@example.com`;
const TEST_PASSWORD = "password123";
const TEST_NAME = "Test User";

describe("auth", () => {
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

  it("POST /api/v1/auth/register return tokens", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
    });
    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.tokens.accessToken).toBeDefined();
    expect(
      response.cookies.find((c) => c.name === "refreshToken"),
    ).toBeDefined();

    const userInDb = await prisma.user.findUnique({
      where: { email: TEST_EMAIL },
    });
    expect(userInDb).not.toBeNull();
  });

  it("POST /api/v1/auth/login wrong password -> 401", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: {
        authorization: `Basic ${(Buffer.from(`${TEST_EMAIL}:wrong-password`)).toString("base64")}`,
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: { code: "UNAUTHENTICATED", message: expect.any(String) },
    });
  });

  it("GET /api/v1/users/me no token -> 401", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/users/me",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: { code: "UNAUTHENTICATED", message: expect.any(String) },
    });
  });

  it("GET /api/v1/users/me invalid token → 401", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/users/me",
      headers: {
        authorization: "Bearer invalid.token.here",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: { code: "UNAUTHENTICATED", message: expect.any(String) },
    });
  });

  it("POST /api/v1/auth/login valid credentials → 200, returns access token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: {
        authorization:
          "Basic " +
          Buffer.from(`${TEST_EMAIL}:${TEST_PASSWORD}`).toString("base64"),
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.accessToken).toBeDefined();
    expect(
      response.cookies.find((c) => c.name === "refreshToken"),
    ).toBeDefined();
  });

  it("GET /api/v1/users/me valid token -> 200", async () => {
    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: {
        authorization: `Basic                          
  ${Buffer.from(`${TEST_EMAIL}:${TEST_PASSWORD}`).toString("base64")}`,
      },
    });

    const { accessToken } = login.json();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/users/me",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().email).toBe(TEST_EMAIL);
  });

  it("POST /api/v1/auth/refresh valid token → 200, returns new access token", async () => {
    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: {
        authorization: `Basic             
  ${Buffer.from(`${TEST_EMAIL}:${TEST_PASSWORD}`).toString("base64")}`,
      },
    });

    const refreshCookie = login.cookies.find((c) => c.name === "refreshToken");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      // biome-ignore lint/style/noNonNullAssertion: <refreshCookies must be set, tested earlier>
      cookies: { refreshToken: refreshCookie!.value },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().accessToken).toBeDefined();
    expect(
      response.cookies.find((c) => c.name === "refreshToken"),
    ).toBeDefined();
  });

  it("POST /api/v1/auth/refresh missing token → 401", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: { code: "UNAUTHENTICATED", message: expect.any(String) },
    });
  });
});
