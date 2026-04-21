import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError, ValidationError } from "./errors.js";

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if ("validation" in error && error.validation) {
    return reply.status(400).send({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: error.validation.map((v) => ({
          field: v.instancePath.replace("/", "") || v.params?.missingProperty,
          message: v.message,
        })),
      },
    });
  }

  if (error instanceof ValidationError) {
    return reply.status(400).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // Unexpected errors — log and return 500
  request.log.error(error);
  return reply.status(500).send({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    },
  });
}
