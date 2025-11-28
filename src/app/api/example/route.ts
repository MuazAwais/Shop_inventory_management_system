/**
 * Example API route demonstrating error handling, validation, and result types
 * This is a reference implementation - delete or modify as needed
 */

import { NextRequest } from "next/server";
import {
  validateRequestBody,
  validateQueryParams,
  commonSchemas,
} from "@/lib/validation";
import { productSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  withResultHandling,
} from "@/lib/api-response";
import { Result, resultify } from "@/lib/result";
import { NotFoundError, BadRequestError } from "@/lib/errors";
import { ProductService } from "@/services";

/**
 * GET /api/example
 * Example with query validation and result types
 */
export async function GET(request: NextRequest) {
  return withResultHandling(async () => {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryResult = await validateQueryParams(
      commonSchemas.pagination,
      searchParams
    );

    if (queryResult.isFailure()) {
      return queryResult.error;
    }

    const { page, limit } = queryResult.value;

    // Use resultify for async operations
    const productsResult = await resultify(
      ProductService.getLowStock()
    );

    if (productsResult.isFailure()) {
      throw productsResult.error;
    }

    return {
      products: productsResult.value,
      pagination: { page, limit },
    };
  });
}

/**
 * POST /api/example
 * Example with request body validation
 */
export async function POST(request: NextRequest) {
  // Validate request body
  const validationResult = await validateRequestBody(
    productSchemas.create,
    request
  );

  if (validationResult.isFailure()) {
    return validationErrorResponse(
      validationResult.error.errors || {},
      validationResult.error.message
    );
  }

  const productData = validationResult.value;

  // Create product with error handling
  try {
    const product = await ProductService.createProduct(productData);
    return successResponse(product, "Product created successfully", 201);
  } catch (error) {
    return errorResponse(error);
  }
}

