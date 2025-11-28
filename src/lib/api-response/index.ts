/**
 * API response utilities
 * Standardized response format for Next.js API routes
 */

import { NextResponse } from "next/server";
import { AppError, isAppError, toAppError } from "@/lib/errors";
import { Result } from "@/lib/result";
import { ApiResponse } from "@/types";

/**
 * Create a success API response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred",
  defaultStatus: number = 500
): NextResponse<ApiResponse> {
  const appError = toAppError(error);

  return NextResponse.json(
    {
      success: false,
      error: appError.message,
      message: appError.message,
    },
    { status: appError.statusCode || defaultStatus }
  );
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string[]>,
  message: string = "Validation failed"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      message,
      data: { errors },
    },
    { status: 422 }
  );
}

/**
 * Create a not found response
 */
export function notFoundResponse(
  resource: string = "Resource"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} not found`,
      message: `${resource} not found`,
    },
    { status: 404 }
  );
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(
  message: string = "Unauthorized"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      message,
    },
    { status: 401 }
  );
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(
  message: string = "Forbidden"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      message,
    },
    { status: 403 }
  );
}

/**
 * Create a conflict error response (409)
 */
export function conflictErrorResponse(
  message: string = "Conflict"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      message,
    },
    { status: 409 }
  );
}

/**
 * Handle Result type and convert to API response
 */
export function resultResponse<T>(
  result: Result<T, AppError>
): NextResponse<ApiResponse<T>> {
  if (result.isSuccess()) {
    return successResponse(result.value);
  }

  return errorResponse(result.error);
}

/**
 * Wrap an async handler with error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<T>
): Promise<NextResponse<ApiResponse<T>>> {
  return handler()
    .then((data) => successResponse(data))
    .catch((error) => errorResponse(error));
}

/**
 * Wrap a Result-returning handler
 */
export function withResultHandling<T>(
  handler: () => Promise<Result<T, AppError>>
): Promise<NextResponse<ApiResponse<T>>> {
  return handler().then((result) => resultResponse(result));
}

