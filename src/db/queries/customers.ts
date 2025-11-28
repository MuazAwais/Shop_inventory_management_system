import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Customers queries
 */

export async function getAllCustomers() {
  return await db.select().from(customers);
}

export async function getCustomerById(id: number) {
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getCustomerByPhone(phone: string) {
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.phone, phone))
    .limit(1);

  return result[0] || null;
}

export async function createCustomer(data: typeof customers.$inferInsert) {
  const [newCustomer] = await db
    .insert(customers)
    .values(data)
    .returning();

  return newCustomer;
}

export async function updateCustomer(id: number, data: Partial<typeof customers.$inferInsert>) {
  const [updated] = await db
    .update(customers)
    .set(data)
    .where(eq(customers.id, id))
    .returning();

  return updated;
}

export async function deleteCustomer(id: number) {
  await db
    .delete(customers)
    .where(eq(customers.id, id));

  return { success: true };
}

