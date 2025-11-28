import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import {
  getExpenseCategoryById,
  updateExpenseCategory,
  deleteExpenseCategory,
} from "@/db/queries/expenses";
import { validateRequestBody } from "@/lib/validation";
import { expenseCategorySchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/api-response";

/**
 * GET /api/expense-categories/[id]
 * Get expense category by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole("admin");
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return errorResponse(new Error("Invalid category ID"), "Invalid category ID", 400);
    }

    const category = await getExpenseCategoryById(categoryId);
    
    if (!category) {
      return notFoundResponse("Expense category");
    }

    return successResponse(category);
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin access required");
    }
    return errorResponse(error);
  }
}

/**
 * PATCH /api/expense-categories/[id]
 * Update expense category (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole("admin");
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return errorResponse(new Error("Invalid category ID"), "Invalid category ID", 400);
    }

    const validationResult = await validateRequestBody(
      expenseCategorySchemas.update,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const category = await getExpenseCategoryById(categoryId);
    if (!category) {
      return notFoundResponse("Expense category");
    }

    const updated = await updateExpenseCategory(categoryId, validationResult.value);
    return successResponse(updated, "Expense category updated successfully");
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin access required");
    }
    return errorResponse(error);
  }
}

/**
 * DELETE /api/expense-categories/[id]
 * Delete expense category (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole("admin");
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return errorResponse(new Error("Invalid category ID"), "Invalid category ID", 400);
    }

    const category = await getExpenseCategoryById(categoryId);
    if (!category) {
      return notFoundResponse("Expense category");
    }

    await deleteExpenseCategory(categoryId);
    return successResponse({}, "Expense category deleted successfully");
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin access required");
    }
    return errorResponse(error);
  }
}

