import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAllUsers } from "@/db/queries/users";
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
} from "@/lib/api-response";

/**
 * GET /api/users
 * Get all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole("admin");
    const users = await getAllUsers();
    return successResponse(users);
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin access required");
    }
    return errorResponse(error);
  }
}

