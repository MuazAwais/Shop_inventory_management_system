import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAllBrands, createBrand } from "@/db/queries/catalog";
import { validateRequestBody } from "@/lib/validation";
import { brandSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

/**
 * GET /api/brands
 * Get all brands (authenticated users)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const brands = await getAllBrands();
    return successResponse(brands);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * POST /api/brands
 * Create new brand (authenticated users)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const validationResult = await validateRequestBody(
      brandSchemas.create,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const brand = await createBrand(validationResult.value);
    return successResponse(brand, "Brand created successfully", 201);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error, error.message || "Failed to create brand", 400);
  }
}

