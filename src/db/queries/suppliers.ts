import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Suppliers queries
 */

export async function getAllSuppliers() {
  return await db.select().from(suppliers);
}

export async function getSupplierById(id: number) {
  const result = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getSupplierByPhone(phone: string) {
  const result = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.phone, phone))
    .limit(1);

  return result[0] || null;
}

export async function createSupplier(data: typeof suppliers.$inferInsert) {
  const [newSupplier] = await db
    .insert(suppliers)
    .values(data)
    .returning();

  return newSupplier;
}

export async function updateSupplier(id: number, data: Partial<typeof suppliers.$inferInsert>) {
  const [updated] = await db
    .update(suppliers)
    .set(data)
    .where(eq(suppliers.id, id))
    .returning();

  return updated;
}

export async function deleteSupplier(id: number) {
  await db
    .delete(suppliers)
    .where(eq(suppliers.id, id));

  return { success: true };
}

