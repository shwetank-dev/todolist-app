import type { ErrorCode } from "@todolist/shared/schemas/error.schema";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super("NOT_FOUND", message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super("CONFLICT", message, 409);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super("UNAUTHENTICATED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super("FORBIDDEN", message, 403);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super("BAD_REQUEST", message, 400);
  }
}

export class ValidationError extends AppError {
  details: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    details: Array<{ field: string; message: string }>,
  ) {
    super("VALIDATION_ERROR", message, 400);
    this.details = details;
  }
}
