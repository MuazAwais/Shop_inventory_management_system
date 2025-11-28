import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { getShopProfile, updateShopProfile } from "@/db/queries/shop";
import { validateRequestBody } from "@/lib/validation";
import { shopProfileSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/api-response";

/**
 * GET /api/shop-profile
 * Get shop profile (admin/manager only)
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "manager"]);
    const profile = await getShopProfile();
    
    if (!profile) {
      return notFoundResponse("Shop profile");
    }

    return successResponse(profile);
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin or Manager access required");
    }
    return errorResponse(error);
  }
}

/**
 * PATCH /api/shop-profile
 * Update shop profile (admin/manager only)
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireRole(["admin", "manager"]);

    const validationResult = await validateRequestBody(
      shopProfileSchemas.update,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const updated = await updateShopProfile(validationResult.value);
    return successResponse(updated, "Shop profile updated successfully");
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin or Manager access required");
    }
    return errorResponse(error);
  }
}

