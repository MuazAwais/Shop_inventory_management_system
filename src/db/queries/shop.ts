import { db } from "@/db";
import { shopProfile, branches } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Shop Profile queries
 */

export async function getShopProfile() {
  const result = await db
    .select()
    .from(shopProfile)
    .limit(1);

  return result[0] || null;
}

export async function updateShopProfile(data: Partial<typeof shopProfile.$inferInsert>) {
  const existing = await getShopProfile();
  
  if (existing) {
    const [updated] = await db
      .update(shopProfile)
      .set(data)
      .where(eq(shopProfile.id, existing.id))
      .returning();
    return updated;
  } else {
    // Create if doesn't exist
    const [created] = await db
      .insert(shopProfile)
      .values({ id: 1, ...data })
      .returning();
    return created;
  }
}

/**
 * Branches queries
 */

export async function getAllBranches() {
  return await db.select().from(branches);
}

export async function getBranchById(id: number) {
  const result = await db
    .select()
    .from(branches)
    .where(eq(branches.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createBranch(data: typeof branches.$inferInsert) {
  const [newBranch] = await db
    .insert(branches)
    .values(data)
    .returning();

  return newBranch;
}

export async function updateBranch(id: number, data: Partial<typeof branches.$inferInsert>) {
  const [updated] = await db
    .update(branches)
    .set(data)
    .where(eq(branches.id, id))
    .returning();

  return updated;
}

export async function deleteBranch(id: number) {
  await db
    .delete(branches)
    .where(eq(branches.id, id));

  return { success: true };
}

