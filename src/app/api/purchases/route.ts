import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { PurchaseService } from "@/services/purchase.service";
import { validateRequestBody } from "@/lib/validation";
import { purchaseSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

/**
 * GET /api/purchases
 * Get purchases with optional filters (authenticated users)
 * Query parameters:
 * - branchId: Filter by branch ID
 * - supplierId: Filter by supplier ID
 * - startDate: Filter by start date (ISO date string)
 * - endDate: Filter by end date (ISO date string)
 * - limit: Limit number of results (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const branchId = searchParams.get("branchId");
    const supplierId = searchParams.get("supplierId");
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

    if (supplierId) {
      const supplierIdNum = parseInt(supplierId);
      if (!isNaN(supplierIdNum)) {
        filters.supplierId = supplierIdNum;
      }
    }

    if (startDate) {
      const date = new Date(startDate);
      if (!isNaN(date.getTime())) {
        filters.startDate = date;
      }
    }

    if (endDate) {
      const date = new Date(endDate);
      if (!isNaN(date.getTime())) {
        filters.endDate = date;
      }
    }

    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        filters.limit = limitNum;
      }
    }

    const purchases = await PurchaseService.getPurchasesWithFilters(filters);
    return successResponse(purchases);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * POST /api/purchases
 * Create new purchase (authenticated users)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const user = auth.user;

    const validationResult = await validateRequestBody(
      purchaseSchemas.create,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const purchaseData = validationResult.value;

    // Create purchase with items and stock update in transaction
    const purchase = await PurchaseService.createPurchase({
      branchId: purchaseData.branchId,
      supplierId: purchaseData.supplierId,
      invoiceNo: purchaseData.invoiceNo,
      purchaseDate: purchaseData.purchaseDate,
      items: purchaseData.items,
      discountAmount: purchaseData.discountAmount,
      paymentMethod: purchaseData.paymentMethod,
      paidAmount: purchaseData.paidAmount,
      notes: purchaseData.notes || null,
      createdBy: user.id,
    });

    return successResponse(purchase, "Purchase created successfully", 201);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error, error.message || "Failed to create purchase", 400);
  }
}

