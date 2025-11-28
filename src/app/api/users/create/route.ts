import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { validateRequestBody } from "@/lib/validation";
import { userSchemas } from "@/lib/validation/schemas";
import { AuthService } from "@/services";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  forbiddenResponse,
} from "@/lib/api-response";

/**
 * POST /api/users/create
 * Create new user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole("admin");

    const validationResult = await validateRequestBody(
      userSchemas.create,
      request
    );

    if (validationResult.isFailure()) {
      return validationErrorResponse(
        validationResult.error.errors || {},
        validationResult.error.message
      );
    }

    const { username, password, name, role, branchId, phone } =
      validationResult.value;

    const user = await AuthService.createUser({
      username,
      password,
      name,
      role,
      branchId: branchId || null,
      phone: phone || null,
    });

    return successResponse(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
      "User created successfully",
      201
    );
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin access required");
    }
    return errorResponse(error, error.message || "Failed to create user", 400);
  }
}

