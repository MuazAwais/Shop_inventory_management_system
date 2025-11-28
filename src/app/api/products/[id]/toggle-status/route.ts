import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getProductById, toggleProductStatus } from "@/db/queries/catalog";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

/**
 * PATCH /api/products/[id]/toggle-status
 * Toggle product status (active/inactive) (authenticated users)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return errorResponse(new Error("Invalid product ID"), "Invalid product ID", 400);
    }

    const product = await getProductById(productId);
    if (!product) {
      return notFoundResponse("Product");
    }

    const newStatus = product.status === "active" ? "inactive" : "active";
    const updated = await toggleProductStatus(productId, newStatus);
    
    return successResponse(updated, `Product ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

