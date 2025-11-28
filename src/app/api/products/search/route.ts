import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ProductService } from "@/services";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { commonSchemas, validateQueryParams } from "@/lib/validation";

/**
 * GET /api/products/search
 * Search products by code, barcode, or name (POS use)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const validationResult = await validateQueryParams(
      commonSchemas.search,
      searchParams,
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message,
      );
    }

    const { query } = validationResult.value;
    const products = await ProductService.search(query);

    return successResponse(products);
  } catch (error: any) {
    if (error.message && error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }

    return errorResponse(error, "Failed to search products");
  }
}
