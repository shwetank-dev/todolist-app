import type { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AuthenticationError } from "../../shared/errors.js";

export default fp(async (fastify) => {
  fastify.decorateRequest("user", null);

  fastify.addHook(
    "preHandler",
    async (request: FastifyRequest, _reply: FastifyReply) => {
      const header = request.headers.authorization;
      if (!header?.startsWith("Bearer ")) return;

      const token = header.slice(7);
      try {
        const payload = jwt.verify(token, env.JWT_SECRET) as {
          id: string;
          email: string;
        };
        request.user = payload;
      } catch {
        throw new AuthenticationError("Invalid or expired token");
      }
    },
  );
});
