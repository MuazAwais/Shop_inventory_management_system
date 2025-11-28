import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { getUserById } from "@/db/queries/users";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
} from "@/lib/api-response";

/**
 * GET /api/users/[id]
 * Get user by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole("admin");
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return errorResponse(new Error("Invalid user ID"), "Invalid user ID", 400);
    }

    const user = await getUserById(userId);
    
    if (!user) {
      return notFoundResponse("User");
    }

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;
    return successResponse(userWithoutPassword);
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin access required");
    }
    return errorResponse(error);
  }
}

/**
 * PATCH /api/users/[id]
 * Update user (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole("admin");
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return errorResponse(new Error("Invalid user ID"), "Invalid user ID", 400);
    }

    const body = await request.json();
    const { isActive, role } = body;

    const updateData: any = {};
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }
    if (role && ["admin", "manager", "cashier", "stock_keeper"].includes(role)) {
      updateData.role = role;
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse(new Error("No valid fields to update"), "No valid fields to update", 400);
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    const updatedUser = await getUserById(userId);
    if (!updatedUser) {
      return notFoundResponse("User");
    }

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return successResponse(userWithoutPassword, "User updated successfully");
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin access required");
    }
    return errorResponse(error);
  }
}

/**
 * DELETE /api/users/[id]
 * Delete user (admin only) - soft delete by deactivating
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole("admin");
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return errorResponse(new Error("Invalid user ID"), "Invalid user ID", 400);
    }

    // Soft delete by deactivating
    await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, userId));

    return successResponse({}, "User deactivated successfully");
  } catch (error: any) {
    if (error.message.includes("Forbidden") || error.message.includes("Insufficient")) {
      return forbiddenResponse("Admin access required");
    }
    return errorResponse(error);
  }
}

