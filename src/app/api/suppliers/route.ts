import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAllSuppliers, createSupplier, getSupplierByPhone } from "@/db/queries/suppliers";
import { validateRequestBody } from "@/lib/validation";
import { supplierSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  conflictErrorResponse,
} from "@/lib/api-response";

/**
 * GET /api/suppliers
 * Get all suppliers (authenticated users)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const suppliers = await getAllSuppliers();
    return successResponse(suppliers);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * POST /api/suppliers
 * Create new supplier (authenticated users)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const validationResult = await validateRequestBody(
      supplierSchemas.create,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const supplierData = validationResult.value;

    // Check if phone number already exists (if provided)
    if (supplierData.phone) {
      const existingSupplier = await getSupplierByPhone(supplierData.phone);
      if (existingSupplier) {
        return conflictErrorResponse("Supplier with this phone number already exists");
      }
    }

    const supplier = await createSupplier(supplierData);
    return successResponse(supplier, "Supplier created successfully", 201);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error, error.message || "Failed to create supplier", 400);
  }
}

