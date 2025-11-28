import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getAllExpenses,
  getExpensesWithFilters,
  createExpense,
} from "@/db/queries/expenses";
import { validateRequestBody } from "@/lib/validation";
import { expenseSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

/**
 * GET /api/expenses
 * Get expenses with optional filters (authenticated users)
 * Query parameters:
 * - branchId: Filter by branch ID
 * - categoryId: Filter by category ID
 * - startDate: Filter by start date (ISO date string)
 * - endDate: Filter by end date (ISO date string)
 * - limit: Limit number of results (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const branchId = searchParams.get("branchId");
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit");

    const filters: any = {};

    if (branchId) {
      const branchIdNum = parseInt(branchId);
      if (!isNaN(branchIdNum)) {
        filters.branchId = branchIdNum;
      }
    }

    if (categoryId) {
      const categoryIdNum = parseInt(categoryId);
      if (!isNaN(categoryIdNum)) {
        filters.categoryId = categoryIdNum;
      }
    }

    if (startDate) {
      const date = new Date(startDate);
      if (!isNaN(date.getTime())) {
        filters.startDate = Math.floor(date.getTime() / 1000 / 86400);
      }
    }

    if (endDate) {
      const date = new Date(endDate);
      if (!isNaN(date.getTime())) {
        filters.endDate = Math.floor(date.getTime() / 1000 / 86400);
      }
    }

    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        filters.limit = limitNum;
      }
    }

    const expenses = await getExpensesWithFilters(filters);
    return successResponse(expenses);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * POST /api/expenses
 * Create new expense (authenticated users)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const user = auth.user;

    const validationResult = await validateRequestBody(
      expenseSchemas.create,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const expenseData = validationResult.value;

    // Convert expense date to days since epoch (mode: "date")
    const expenseDateInt = Math.floor(expenseData.expenseDate.getTime() / 1000 / 86400);

    const expense = await createExpense({
      branchId: expenseData.branchId,
      categoryId: expenseData.categoryId,
      amount: expenseData.amount,
      description: expenseData.description || null,
      expenseDate: expenseDateInt,
      paidTo: expenseData.paidTo || null,
      createdBy: user.id,
    });

    return successResponse(expense, "Expense created successfully", 201);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error, error.message || "Failed to create expense", 400);
  }
}

