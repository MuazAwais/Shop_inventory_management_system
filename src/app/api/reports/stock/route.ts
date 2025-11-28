import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getStockLevelReport,
  getLowStockAlerts,
} from "@/db/queries/reports";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

/**
 * GET /api/reports/stock
 * Get stock level reports (authenticated users)
 * Query parameters:
 * - reportType: "levels" | "low-stock" (default: "levels")
 * - minStockLevel: Minimum stock level for filtering (for levels report)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const reportType = searchParams.get("reportType") || "levels";
    const minStockLevel = searchParams.get("minStockLevel");

    let report;
    if (reportType === "low-stock") {
      report = await getLowStockAlerts();
    } else {
      const filters: any = {};
      if (minStockLevel) {
        const minStockLevelNum = parseInt(minStockLevel);
        if (!isNaN(minStockLevelNum)) {
          filters.minStockLevel = minStockLevelNum;
        }
      }
      report = await getStockLevelReport(filters);
    }

    return successResponse(report);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

