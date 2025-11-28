import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/db/queries/catalog";
import { validateRequestBody } from "@/lib/validation";
import { categorySchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

/**
 * GET /api/categories/[id]
 * Get category by ID (authenticated users)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return errorResponse(new Error("Invalid category ID"), "Invalid category ID", 400);
    }

    const category = await getCategoryById(categoryId);
    
    if (!category) {
      return notFoundResponse("Category");
    }

    return successResponse(category);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * PATCH /api/categories/[id]
 * Update category (authenticated users)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return errorResponse(new Error("Invalid category ID"), "Invalid category ID", 400);
    }

    const validationResult = await validateRequestBody(
      categorySchemas.update,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
      return notFoundResponse("Category");
    }

    const updated = await updateCategory(categoryId, validationResult.value);
    return successResponse(updated, "Category updated successfully");
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete category (authenticated users)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return errorResponse(new Error("Invalid category ID"), "Invalid category ID", 400);
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
      return notFoundResponse("Category");
    }

    await deleteCategory(categoryId);
    return successResponse({}, "Category deleted successfully");
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

