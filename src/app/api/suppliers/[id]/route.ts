import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSupplierByPhone,
} from "@/db/queries/suppliers";
import { validateRequestBody } from "@/lib/validation";
import { supplierSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  conflictErrorResponse,
} from "@/lib/api-response";

/**
 * GET /api/suppliers/[id]
 * Get supplier by ID (authenticated users)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const supplierId = parseInt(params.id);
    
    if (isNaN(supplierId)) {
      return errorResponse(new Error("Invalid supplier ID"), "Invalid supplier ID", 400);
    }

    const supplier = await getSupplierById(supplierId);
    
    if (!supplier) {
      return notFoundResponse("Supplier");
    }

    return successResponse(supplier);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * PATCH /api/suppliers/[id]
 * Update supplier (authenticated users)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const supplierId = parseInt(params.id);
    
    if (isNaN(supplierId)) {
      return errorResponse(new Error("Invalid supplier ID"), "Invalid supplier ID", 400);
    }

    const supplier = await getSupplierById(supplierId);
    if (!supplier) {
      return notFoundResponse("Supplier");
    }

    const validationResult = await validateRequestBody(
      supplierSchemas.update,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const updateData = validationResult.value as any;

    // If phone is being updated, check for uniqueness
    if (updateData.phone && updateData.phone !== supplier.phone) {
      const existingSupplier = await getSupplierByPhone(updateData.phone);
      if (existingSupplier) {
        return conflictErrorResponse("Supplier with this phone number already exists");
      }
    }

    const updated = await updateSupplier(supplierId, updateData);
    return successResponse(updated, "Supplier updated successfully");
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

/**
 * DELETE /api/suppliers/[id]
 * Delete supplier (authenticated users)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const supplierId = parseInt(params.id);
    
    if (isNaN(supplierId)) {
      return errorResponse(new Error("Invalid supplier ID"), "Invalid supplier ID", 400);
    }

    const supplier = await getSupplierById(supplierId);
    if (!supplier) {
      return notFoundResponse("Supplier");
    }

    await deleteSupplier(supplierId);
    return successResponse({}, "Supplier deleted successfully");
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return unauthorizedResponse("Authentication required");
    }
    return errorResponse(error);
  }
}

