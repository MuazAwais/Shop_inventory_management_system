import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { StockAdjustmentService } from "@/services/stock-adjustment.service";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

/**
 * GET /api/stock-adjustments/[id]
 * Get stock adjustment by ID (authenticated users)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const adjustmentId = parseInt(params.id);
    
    if (isNaN(adjustmentId)) {
      return errorResponse(new Error("Invalid adjustment ID"), "Invalid adjustment ID", 400);
    }

    const adjustment = await StockAdjustmentService.getStockAdjustment(adjustmentId);
    
    if (!adjustment) {
      return notFoundResponse("Stock adjustment");
    }

    return successResponse(adjustment);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

