import {
  AuthTokensSchema,
  type CreateUserInput,
  CreateUserResponseSchema,
  CreateUserSchema,
} from "@todolist/shared/schemas/user.schema";
import type { FastifyPluginAsync } from "fastify";
import { AuthenticationError } from "../../shared/errors.js";
import {
  loginUser,
  logoutUser,
  refreshTokens,
  registerUser,
} from "./auth.controller.js";
import { requireAuth } from "./auth.hooks.js";
import { parseBasicAuth } from "./auth.utils.js";

const REFRESH_COOKIE = "refreshToken";
const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
} as const;

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: CreateUserInput }>(
    "/auth/register",
    {
      config: {
        rateLimit: { max: 10, timeWindow: "1 minute" },
      },
      schema: {
        body: CreateUserSchema,
        response: { 201: CreateUserResponseSchema },
      },
    },
    async (request, reply) => {
      const result = await registerUser(request.body);
      reply.setCookie(REFRESH_COOKIE, result.tokens.refreshToken, COOKIE_OPTS);
      return reply.status(201).send({
        user: result.user,
        tokens: { accessToken: result.tokens.accessToken },
      });
    },
  );

  fastify.post(
    "/auth/login",
    {
      config: {
        rateLimit: { max: 10, timeWindow: "1 minute" },
      },
      schema: {
        response: { 200: AuthTokensSchema },
      },
    },
    async (request, reply) => {
      const credentials = parseBasicAuth(request.headers.authorization);
      if (!credentials)
        throw new AuthenticationError(
          "Invalid or missing username or password",
        );

      const tokens = await loginUser(credentials.email, credentials.password);
      reply.setCookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTS);
      return reply.status(200).send({ accessToken: tokens.accessToken });
    },
  );

  fastify.post("/auth/refresh", async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE];
    if (!token) throw new AuthenticationError("No refresh token provided");

    const tokens = await refreshTokens(token);
    reply.setCookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTS);
    return reply.status(200).send({ accessToken: tokens.accessToken });
  });

  fastify.post(
    "/auth/logout",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      if (!request.user)
        throw new AuthenticationError("Authentication required");
      await logoutUser(request.user.id);
      reply.clearCookie(REFRESH_COOKIE, { path: "/" });
      return reply.status(204).send();
    },
  );
};
