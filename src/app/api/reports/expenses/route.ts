import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getExpenseSummaryByCategory,
  getExpenseSummaryByBranch,
} from "@/db/queries/reports";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

/**
 * GET /api/reports/expenses
 * Get expense reports (authenticated users)
 * Query parameters:
 * - branchId: Filter by branch ID (for category report)
 * - categoryId: Filter by category ID (for branch report)
 * - startDate: Filter by start date (ISO date string)
 * - endDate: Filter by end date (ISO date string)
 * - reportType: "by-category" | "by-branch" (default: "by-category")
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const branchId = searchParams.get("branchId");
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("reportType") || "by-category";

    const filters: any = {};

    if (branchId && reportType === "by-category") {
      const branchIdNum = parseInt(branchId);
      if (!isNaN(branchIdNum)) {
        filters.branchId = branchIdNum;
      }
    }

    if (categoryId && reportType === "by-branch") {
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

    let report;
    if (reportType === "by-branch") {
      report = await getExpenseSummaryByBranch(filters);
    } else {
      report = await getExpenseSummaryByCategory(filters);
    }

    return successResponse(report);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

