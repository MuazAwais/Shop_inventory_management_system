import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { PurchaseService } from "@/services/purchase.service";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

/**
 * GET /api/purchases/[id]
 * Get purchase by ID with items (authenticated users)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const purchaseId = parseInt(params.id);
    
    if (isNaN(purchaseId)) {
      return errorResponse(new Error("Invalid purchase ID"), "Invalid purchase ID", 400);
    }

    const purchase = await PurchaseService.getPurchaseWithItems(purchaseId);
    
    if (!purchase) {
      return notFoundResponse("Purchase");
    }

    return successResponse(purchase);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

