import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { getBranchById, updateBranch, deleteBranch } from "@/db/queries/shop";
import { validateRequestBody } from "@/lib/validation";
import { branchSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/api-response";

/**
 * GET /api/branches/[id]
 * Get branch by ID (admin/manager only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["admin", "manager"]);
    const branchId = parseInt(params.id);
    
    if (isNaN(branchId)) {
      return errorResponse(new Error("Invalid branch ID"), "Invalid branch ID", 400);
    }

    const branch = await getBranchById(branchId);
    
    if (!branch) {
      return notFoundResponse("Branch");
    }

    return successResponse(branch);
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin or Manager access required");
    }
    return errorResponse(error);
  }
}

/**
 * PATCH /api/branches/[id]
 * Update branch (admin/manager only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["admin", "manager"]);
    const branchId = parseInt(params.id);
    
    if (isNaN(branchId)) {
      return errorResponse(new Error("Invalid branch ID"), "Invalid branch ID", 400);
    }

    const validationResult = await validateRequestBody(
      branchSchemas.update,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const branch = await getBranchById(branchId);
    if (!branch) {
      return notFoundResponse("Branch");
    }

    const updated = await updateBranch(branchId, validationResult.value);
    return successResponse(updated, "Branch updated successfully");
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin or Manager access required");
    }
    return errorResponse(error);
  }
}

/**
 * DELETE /api/branches/[id]
 * Delete branch (admin/manager only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["admin", "manager"]);
    const branchId = parseInt(params.id);
    
    if (isNaN(branchId)) {
      return errorResponse(new Error("Invalid branch ID"), "Invalid branch ID", 400);
    }

    const branch = await getBranchById(branchId);
    if (!branch) {
      return notFoundResponse("Branch");
    }

    await deleteBranch(branchId);
    return successResponse({}, "Branch deleted successfully");
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin or Manager access required");
    }
    return errorResponse(error);
  }
}

