import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import {
  getAllExpenseCategories,
  createExpenseCategory,
} from "@/db/queries/expenses";
import { validateRequestBody } from "@/lib/validation";
import { expenseCategorySchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  forbiddenResponse,
} from "@/lib/api-response";

/**
 * GET /api/expense-categories
 * Get all expense categories (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole("admin");
    const categories = await getAllExpenseCategories();
    return successResponse(categories);
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin access required");
    }
    return errorResponse(error);
  }
}

/**
 * POST /api/expense-categories
 * Create new expense category (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole("admin");

    const validationResult = await validateRequestBody(
      expenseCategorySchemas.create,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const category = await createExpenseCategory(validationResult.value);
    return successResponse(category, "Expense category created successfully", 201);
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin access required");
    }
    return errorResponse(error, error.message || "Failed to create expense category", 400);
  }
}

