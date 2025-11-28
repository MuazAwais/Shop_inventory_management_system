/**
 * Custom error classes for application errors
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", details?: any) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", details?: any) {
    super(message, 409, "CONFLICT", details);
  }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", public errors?: Record<string, string[]>) {
    super(message, 422, "VALIDATION_ERROR", errors);
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error", details?: any) {
    super(message, 500, "INTERNAL_SERVER_ERROR", details);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", details?: any) {
    super(message, 500, "DATABASE_ERROR", details);
  }
}

/**
 * Check if error is an AppError instance
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert any error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message, { originalError: error.name });
  }

  return new InternalServerError("An unknown error occurred", { originalError: error });
}

