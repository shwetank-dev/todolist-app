import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticationError } from "../../shared/errors.js";

export const requireAuth = async (
  request: FastifyRequest,
  _reply: FastifyReply,
) => {
  if (!request.user) {
    throw new AuthenticationError("Authentication Required");
  }
};
