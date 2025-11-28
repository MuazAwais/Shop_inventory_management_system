import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getSalesReportByBranchAndPaymentMethod,
  getDailySalesSummary,
} from "@/db/queries/reports";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

/**
 * GET /api/reports/sales
 * Get sales reports (authenticated users)
 * Query parameters:
 * - branchId: Filter by branch ID
 * - startDate: Filter by start date (ISO date string)
 * - endDate: Filter by end date (ISO date string)
 * - reportType: "by-payment-method" | "daily-summary" (default: "by-payment-method")
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const branchId = searchParams.get("branchId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("reportType") || "by-payment-method";

    const filters: any = {};

    if (branchId) {
      const branchIdNum = parseInt(branchId);
      if (!isNaN(branchIdNum)) {
        filters.branchId = branchIdNum;
      }
    }

    if (startDate) {
      const date = new Date(startDate);
      if (!isNaN(date.getTime())) {
        filters.startDate = Math.floor(date.getTime() / 1000);
      }
    }

    if (endDate) {
      const date = new Date(endDate);
      if (!isNaN(date.getTime())) {
        filters.endDate = Math.floor(date.getTime() / 1000);
      }
    }

    let report;
    if (reportType === "daily-summary") {
      report = await getDailySalesSummary(filters);
    } else {
      report = await getSalesReportByBranchAndPaymentMethod(filters);
    }

    return successResponse(report);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

