import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getReceiptData } from "@/db/queries/sales";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

/**
 * GET /api/sales/[id]/receipt
 * Get receipt data for a sale
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const saleId = parseInt(params.id);

    if (isNaN(saleId)) {
      return errorResponse(
        new Error("Invalid sale ID"),
        "Invalid sale ID",
        400
      );
    }

    const receiptData = await getReceiptData(saleId);

    if (!receiptData) {
      return notFoundResponse("Sale");
    }

    return successResponse(receiptData);
  } catch (error: any) {
    if (error.message && error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }

    return errorResponse(error, "Failed to fetch receipt data");
  }
}

