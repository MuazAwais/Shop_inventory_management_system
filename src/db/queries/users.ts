import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * User queries
 */

export async function getUserById(id: number) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getUserByUsername(username: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return result[0] || null;
}

export async function getUsersByBranch(branchId: number) {
  return await db
    .select()
    .from(users)
    .where(and(eq(users.branchId, branchId), eq(users.isActive, true)));
}

export async function getAllUsers() {
  return await db.select().from(users);
}

