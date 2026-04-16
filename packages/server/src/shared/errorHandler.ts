import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from "./errors.js";

export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ValidationError) {
    return reply.status(400).send({
      error: "VALIDATION_ERROR",
      message: error.message,
      fields: error.fields,
    });
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      error: "BAD_REQUEST",
      message: error.message,
    });
  }

  if (error instanceof UnauthenticatedError) {
    return reply.status(401).send({
      error: "UNAUTHENTICATED",
      message: error.message,
    });
  }

  if (error instanceof ForbiddenError) {
    return reply.status(403).send({
      error: "FORBIDDEN",
      message: error.message,
    });
  }

  if (error instanceof NotFoundError) {
    return reply.status(404).send({
      error: "NOT_FOUND",
      message: error.message,
    });
  }

  if (error instanceof ConflictError) {
    return reply.status(409).send({
      error: "CONFLICT",
      message: error.message,
    });
  }

  // Fastify validation errors (schema validation failures)
  if ("statusCode" in error && error.statusCode === 400) {
    return reply.status(400).send({
      error: "BAD_REQUEST",
      message: error.message,
    });
  }

  // Unexpected errors — don't leak internals
  reply.status(500).send({
    error: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong",
  });
}
