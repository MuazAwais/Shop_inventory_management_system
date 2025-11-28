import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getPurchaseSummaryBySupplier,
  getPurchaseSummaryByBranch,
} from "@/db/queries/reports";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

/**
 * GET /api/reports/purchases
 * Get purchase reports (authenticated users)
 * Query parameters:
 * - startDate: Filter by start date (ISO date string)
 * - endDate: Filter by end date (ISO date string)
 * - reportType: "by-supplier" | "by-branch" (default: "by-supplier")
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("reportType") || "by-supplier";

    const filters: any = {};

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
      report = await getPurchaseSummaryByBranch(filters);
    } else {
      report = await getPurchaseSummaryBySupplier(filters);
    }

    return successResponse(report);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

