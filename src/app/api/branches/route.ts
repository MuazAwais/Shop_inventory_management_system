import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAllBranches, createBranch } from "@/db/queries/shop";
import { validateRequestBody } from "@/lib/validation";
import { branchSchemas } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  forbiddenResponse,
} from "@/lib/api-response";

/**
 * GET /api/branches
 * Get all branches (admin/manager only)
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "manager"]);
    const branches = await getAllBranches();
    return successResponse(branches);
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin or Manager access required");
    }
    return errorResponse(error);
  }
}

/**
 * POST /api/branches
 * Create new branch (admin/manager only)
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(["admin", "manager"]);

    const validationResult = await validateRequestBody(
      branchSchemas.create,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const branch = await createBranch(validationResult.value);
    return successResponse(branch, "Branch created successfully", 201);
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin or Manager access required");
    }
    return errorResponse(error, error.message || "Failed to create branch", 400);
  }
}

