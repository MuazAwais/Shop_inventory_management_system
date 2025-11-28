import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getBrandById, updateBrand, deleteBrand } from "@/db/queries/catalog";
import { validateRequestBody } from "@/lib/validation";
import { brandSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

/**
 * GET /api/brands/[id]
 * Get brand by ID (authenticated users)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const brandId = parseInt(params.id);
    
    if (isNaN(brandId)) {
      return errorResponse(new Error("Invalid brand ID"), "Invalid brand ID", 400);
    }

    const brand = await getBrandById(brandId);
    
    if (!brand) {
      return notFoundResponse("Brand");
    }

    return successResponse(brand);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * PATCH /api/brands/[id]
 * Update brand (authenticated users)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const brandId = parseInt(params.id);
    
    if (isNaN(brandId)) {
      return errorResponse(new Error("Invalid brand ID"), "Invalid brand ID", 400);
    }

    const validationResult = await validateRequestBody(
      brandSchemas.update,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const brand = await getBrandById(brandId);
    if (!brand) {
      return notFoundResponse("Brand");
    }

    const updated = await updateBrand(brandId, validationResult.value);
    return successResponse(updated, "Brand updated successfully");
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * DELETE /api/brands/[id]
 * Delete brand (authenticated users)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const brandId = parseInt(params.id);
    
    if (isNaN(brandId)) {
      return errorResponse(new Error("Invalid brand ID"), "Invalid brand ID", 400);
    }

    const brand = await getBrandById(brandId);
    if (!brand) {
      return notFoundResponse("Brand");
    }

    await deleteBrand(brandId);
    return successResponse({}, "Brand deleted successfully");
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

