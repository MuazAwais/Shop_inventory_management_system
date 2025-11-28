/**
 * Request validation utilities using Yup
 */

import * as yup from "yup";
import { ValidationError as YupValidationError } from "yup";
import { ValidationError } from "@/lib/errors";
import { Result, failure, success } from "@/lib/result";

/**
 * Validation schema types
 */
export type ValidationSchema<T> = yup.ObjectSchema<T>;

/**
 * Validate data against a Yup schema
 * Returns Result type for functional error handling
 */
export async function validate<T>(
  schema: yup.ObjectSchema<T>,
  data: unknown
): Promise<Result<T, ValidationError>> {
  try {
    const validated = await schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return success(validated);
  } catch (error) {
    if (error instanceof YupValidationError) {
      const validationError = formatYupError(error);
      return failure(validationError);
    }
    return failure(
      new ValidationError("Validation failed", { originalError: error })
    );
  }
}

/**
 * Validate data and throw on error (for use in try-catch blocks)
 */
export async function validateOrThrow<T>(
  schema: yup.ObjectSchema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    if (error instanceof YupValidationError) {
      throw formatYupError(error);
    }
    throw new ValidationError("Validation failed", { originalError: error });
  }
}

/**
 * Format Yup validation error to our ValidationError
 */
function formatYupError(error: YupValidationError): ValidationError {
  const errors: Record<string, string[]> = {};

  if (error.inner && error.inner.length > 0) {
    error.inner.forEach((err) => {
      if (err.path) {
        if (!errors[err.path]) {
          errors[err.path] = [];
        }
        errors[err.path].push(err.message);
      }
    });
  } else if (error.path) {
    errors[error.path] = [error.message];
  }

  return new ValidationError(error.message || "Validation failed", errors);
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  /**
   * Pagination schema
   */
  pagination: yup.object({
    page: yup.number().integer().min(1).default(1),
    limit: yup.number().integer().min(1).max(100).default(10),
  }),

  /**
   * ID parameter schema
   */
  idParam: yup.object({
    id: yup.number().integer().positive().required(),
  }),

  /**
   * Date range schema
   */
  dateRange: yup.object({
    startDate: yup.date().required(),
    endDate: yup.date().required().min(yup.ref("startDate"), "End date must be after start date"),
  }),

  /**
   * Search query schema
   */
  search: yup.object({
    query: yup.string().min(1).max(200).required(),
  }),
};

/**
 * Validate request body in Next.js API route
 */
export async function validateRequestBody<T>(
  schema: yup.ObjectSchema<T>,
  request: Request
): Promise<Result<T, ValidationError>> {
  try {
    const body = await request.json();
    return await validate(schema, body);
  } catch (error) {
    return failure(
      new ValidationError("Invalid request body", {
        originalError: error instanceof Error ? error.message : String(error),
      })
    );
  }
}

/**
 * Validate query parameters in Next.js API route
 */
export async function validateQueryParams<T>(
  schema: yup.ObjectSchema<T>,
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): Promise<Result<T, ValidationError>> {
  const params: Record<string, any> = {};

  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } else {
    Object.entries(searchParams).forEach(([key, value]) => {
      params[key] = Array.isArray(value) ? value[0] : value;
    });
  }

  return await validate(schema, params);
}

/**
 * Validate route parameters
 */
export async function validateRouteParams<T>(
  schema: yup.ObjectSchema<T>,
  params: Record<string, string | string[] | undefined>
): Promise<Result<T, ValidationError>> {
  const routeParams: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    routeParams[key] = Array.isArray(value) ? value[0] : value;
  });

  return await validate(schema, routeParams);
}

