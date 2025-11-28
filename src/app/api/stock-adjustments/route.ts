import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { StockAdjustmentService } from "@/services/stock-adjustment.service";
import { validateRequestBody } from "@/lib/validation";
import { stockAdjustmentSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

/**
 * GET /api/stock-adjustments
 * Get stock adjustments with optional filters (authenticated users)
 * Query parameters:
 * - branchId: Filter by branch ID
 * - productId: Filter by product ID
 * - startDate: Filter by start date (ISO date string)
 * - endDate: Filter by end date (ISO date string)
 * - limit: Limit number of results (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const branchId = searchParams.get("branchId");
    const productId = searchParams.get("productId");
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

    if (productId) {
      const productIdNum = parseInt(productId);
      if (!isNaN(productIdNum)) {
        filters.productId = productIdNum;
      }
    }

    if (startDate) {
      try {
        // Parse date string (format: YYYY-MM-DD)
        // Create date in local timezone to avoid UTC issues
        const [year, month, day] = startDate.split('-').map(Number);
        if (year && month && day) {
          const date = new Date(year, month - 1, day, 0, 0, 0, 0); // month is 0-indexed
          if (!isNaN(date.getTime())) {
            filters.startDate = date;
          }
        } else {
          // Fallback to standard Date parsing
          const date = new Date(startDate);
          if (!isNaN(date.getTime())) {
            date.setHours(0, 0, 0, 0);
            filters.startDate = date;
          }
        }
      } catch (err) {
        // Invalid date format, skip this filter
        console.error("Invalid startDate format:", startDate);
      }
    }

    if (endDate) {
      try {
        // Parse date string (format: YYYY-MM-DD)
        // Create date in local timezone to avoid UTC issues
        const [year, month, day] = endDate.split('-').map(Number);
        if (year && month && day) {
          const date = new Date(year, month - 1, day, 23, 59, 59, 999); // month is 0-indexed
          if (!isNaN(date.getTime())) {
            filters.endDate = date;
          }
        } else {
          // Fallback to standard Date parsing
          const date = new Date(endDate);
          if (!isNaN(date.getTime())) {
            date.setHours(23, 59, 59, 999);
            filters.endDate = date;
          }
        }
      } catch (err) {
        // Invalid date format, skip this filter
        console.error("Invalid endDate format:", endDate);
      }
    }

    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        filters.limit = limitNum;
      }
    }

    const adjustments = await StockAdjustmentService.getStockAdjustmentsWithFilters(filters);
    return successResponse(adjustments);
  } catch (error: any) {
    if (error.message && error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    console.error("Error fetching stock adjustments:", error);
    return errorResponse(error, error.message || "Failed to fetch stock adjustments");
  }
}

/**
 * POST /api/stock-adjustments
 * Create new stock adjustment (authenticated users)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const user = auth.user;

    const validationResult = await validateRequestBody(
      stockAdjustmentSchemas.create,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const adjustmentData = validationResult.value;

    // Create stock adjustment with stock update in transaction
    const adjustment = await StockAdjustmentService.createStockAdjustment({
      branchId: adjustmentData.branchId || undefined,
      productId: adjustmentData.productId,
      qtyChange: adjustmentData.qtyChange,
      reason: adjustmentData.reason,
      notes: adjustmentData.notes || undefined,
      adjustedBy: user.id,
    });

    return successResponse(adjustment, "Stock adjustment created successfully", 201);
  } catch (error: any) {
    if (error.message && error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    console.error("Error creating stock adjustment:", error);
    return errorResponse(error, error.message || "Failed to create stock adjustment", 400);
  }
}

