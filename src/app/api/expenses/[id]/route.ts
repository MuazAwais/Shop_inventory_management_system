import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "@/db/queries/expenses";
import { validateRequestBody } from "@/lib/validation";
import { expenseSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

/**
 * GET /api/expenses/[id]
 * Get expense by ID (authenticated users)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const expenseId = parseInt(params.id);
    
    if (isNaN(expenseId)) {
      return errorResponse(new Error("Invalid expense ID"), "Invalid expense ID", 400);
    }

    const expense = await getExpenseById(expenseId);
    
    if (!expense) {
      return notFoundResponse("Expense");
    }

    return successResponse(expense);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * PATCH /api/expenses/[id]
 * Update expense (authenticated users)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const expenseId = parseInt(params.id);
    
    if (isNaN(expenseId)) {
      return errorResponse(new Error("Invalid expense ID"), "Invalid expense ID", 400);
    }

    const expense = await getExpenseById(expenseId);
    if (!expense) {
      return notFoundResponse("Expense");
    }

    const validationResult = await validateRequestBody(
      expenseSchemas.update,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const updateData: any = validationResult.value;

    // Convert expense date if provided
    if (updateData.expenseDate) {
      updateData.expenseDate = Math.floor(updateData.expenseDate.getTime() / 1000 / 86400);
    }

    const updated = await updateExpense(expenseId, updateData);
    return successResponse(updated, "Expense updated successfully");
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * DELETE /api/expenses/[id]
 * Delete expense (authenticated users)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const expenseId = parseInt(params.id);
    
    if (isNaN(expenseId)) {
      return errorResponse(new Error("Invalid expense ID"), "Invalid expense ID", 400);
    }

    const expense = await getExpenseById(expenseId);
    if (!expense) {
      return notFoundResponse("Expense");
    }

    await deleteExpense(expenseId);
    return successResponse({}, "Expense deleted successfully");
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

