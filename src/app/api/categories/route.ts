import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getAllCategories,
  createCategory,
} from "@/db/queries/catalog";
import { validateRequestBody } from "@/lib/validation";
import { categorySchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

/**
 * GET /api/categories
 * Get all categories (authenticated users)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const categories = await getAllCategories();
    return successResponse(categories);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * POST /api/categories
 * Create new category (authenticated users)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const validationResult = await validateRequestBody(
      categorySchemas.create,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const category = await createCategory(validationResult.value);
    return successResponse(category, "Category created successfully", 201);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error, error.message || "Failed to create category", 400);
  }
}

