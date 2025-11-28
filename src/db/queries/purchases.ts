import { db } from "@/db";
import { purchases, purchaseItems, suppliers, products } from "@/db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

/**
 * Purchase queries
 */

export async function getPurchaseById(id: number) {
  const result = await db
    .select()
    .from(purchases)
    .where(eq(purchases.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getPurchaseWithItems(purchaseId: number) {
  const purchase = await getPurchaseById(purchaseId);
  if (!purchase) return null;

  const items = await db
    .select()
    .from(purchaseItems)
    .where(eq(purchaseItems.purchaseId, purchaseId));

  return { ...purchase, items };
}

export async function getPurchasesByBranch(branchId: number, limit: number = 50) {
  return await db
    .select()
    .from(purchases)
    .where(eq(purchases.branchId, branchId))
    .orderBy(desc(purchases.purchaseDate))
    .limit(limit);
}

export async function getPurchasesBySupplier(supplierId: number) {
  return await db
    .select()
    .from(purchases)
    .where(eq(purchases.supplierId, supplierId))
    .orderBy(desc(purchases.purchaseDate));
}

export async function getAllSuppliers() {
  return await db.select().from(suppliers);
}

/**
 * Get purchases with filters (supplier, date range, branch)
 */
export async function getPurchasesWithFilters(filters: {
  branchId?: number;
  supplierId?: number;
  startDate?: number; // days since epoch
  endDate?: number; // days since epoch
  limit?: number;
}) {
  const conditions = [];

  if (filters.branchId) {
    conditions.push(eq(purchases.branchId, filters.branchId));
  }

  if (filters.supplierId) {
    conditions.push(eq(purchases.supplierId, filters.supplierId));
  }

  if (filters.startDate !== undefined) {
    conditions.push(gte(purchases.purchaseDate, filters.startDate));
  }

  if (filters.endDate !== undefined) {
    conditions.push(lte(purchases.purchaseDate, filters.endDate));
  }

  const baseQuery = db.select().from(purchases);

  if (conditions.length > 0) {
    const filteredQuery = baseQuery.where(and(...conditions));
    const orderedQuery = filteredQuery.orderBy(desc(purchases.purchaseDate));
    
    if (filters.limit) {
      return await orderedQuery.limit(filters.limit);
    }
    
    return await orderedQuery;
  }

  const orderedQuery = baseQuery.orderBy(desc(purchases.purchaseDate));
  
  if (filters.limit) {
    return await orderedQuery.limit(filters.limit);
  }
  
  return await orderedQuery;
}

/**
 * Get all purchases
 */
export async function getAllPurchases(limit: number = 100) {
  return await db
    .select()
    .from(purchases)
    .orderBy(desc(purchases.purchaseDate))
    .limit(limit);
}

/**
 * Create purchase with items and update product stock in a single transaction
 */
export async function createPurchaseWithItems(data: {
  purchase: typeof purchases.$inferInsert;
  items: Array<{
    productId: number;
    qty: number;
    unitPrice: number;
    gstPercent: number;
    totalPrice: number;
  }>;
}) {
  return await db.transaction(async (tx) => {
    // 1. Create purchase header
    const [newPurchase] = await tx
      .insert(purchases)
      .values(data.purchase)
      .returning();

    // 2. Create purchase items and update stock for each item
    const createdItems = [];
    for (const item of data.items) {
      // Insert purchase item
      const [newItem] = await tx
        .insert(purchaseItems)
        .values({
          purchaseId: newPurchase.id,
          productId: item.productId,
          qty: item.qty,
          unitPrice: item.unitPrice,
          gstPercent: item.gstPercent,
          totalPrice: item.totalPrice,
        })
        .returning();

      createdItems.push(newItem);

      // Update product stock (add quantity)
      // Use COALESCE to handle null stock values
      await tx
        .update(products)
        .set({
          stockQty: sql`COALESCE(${products.stockQty}, 0) + ${item.qty}`,
        })
        .where(eq(products.id, item.productId));
    }

    // Return purchase with items
    return {
      ...newPurchase,
      items: createdItems,
    };
  });
}

