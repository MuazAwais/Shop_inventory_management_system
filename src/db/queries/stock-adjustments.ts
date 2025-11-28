import { db } from "@/db";
import { stockAdjustments, products } from "@/db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

/**
 * Stock adjustment queries
 */

export async function getStockAdjustmentById(id: number) {
  const result = await db
    .select()
    .from(stockAdjustments)
    .where(eq(stockAdjustments.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getAllStockAdjustments(limit: number = 100) {
  return await db
    .select()
    .from(stockAdjustments)
    .orderBy(desc(stockAdjustments.createdAt))
    .limit(limit);
}

export async function getStockAdjustmentsByBranch(branchId: number, limit: number = 100) {
  return await db
    .select()
    .from(stockAdjustments)
    .where(eq(stockAdjustments.branchId, branchId))
    .orderBy(desc(stockAdjustments.createdAt))
    .limit(limit);
}

export async function getStockAdjustmentsByProduct(productId: number, limit: number = 100) {
  return await db
    .select()
    .from(stockAdjustments)
    .where(eq(stockAdjustments.productId, productId))
    .orderBy(desc(stockAdjustments.createdAt))
    .limit(limit);
}

export async function getStockAdjustmentsWithFilters(filters: {
  branchId?: number;
  productId?: number;
  startDate?: Date; // Date object - Drizzle will convert to timestamp
  endDate?: Date; // Date object - Drizzle will convert to timestamp
  limit?: number;
}) {
  const conditions = [];

  if (filters.branchId) {
    conditions.push(eq(stockAdjustments.branchId, filters.branchId));
  }

  if (filters.productId) {
    conditions.push(eq(stockAdjustments.productId, filters.productId));
  }

  if (filters.startDate !== undefined && filters.startDate !== null) {
    conditions.push(gte(stockAdjustments.createdAt, filters.startDate));
  }

  if (filters.endDate !== undefined && filters.endDate !== null) {
    conditions.push(lte(stockAdjustments.createdAt, filters.endDate));
  }

  const baseQuery = db.select().from(stockAdjustments);

  if (conditions.length > 0) {
    const filteredQuery = baseQuery.where(and(...conditions));
    const orderedQuery = filteredQuery.orderBy(desc(stockAdjustments.createdAt));
    
    if (filters.limit) {
      return await orderedQuery.limit(filters.limit);
    }
    
    return await orderedQuery;
  }

  const orderedQuery = baseQuery.orderBy(desc(stockAdjustments.createdAt));
  
  if (filters.limit) {
    return await orderedQuery.limit(filters.limit);
  }
  
  return await orderedQuery;
}

/**
 * Create stock adjustment and update product stock in a single transaction
 */
export async function createStockAdjustment(data: {
  adjustment: typeof stockAdjustments.$inferInsert;
}) {
  return await db.transaction(async (tx) => {
    // 1. Create stock adjustment
    const [newAdjustment] = await tx
      .insert(stockAdjustments)
      .values(data.adjustment)
      .returning();

    // 2. Update product stock (add qtyChange)
    // Use COALESCE to handle null stock values
    if (data.adjustment.productId && data.adjustment.qtyChange !== null) {
      await tx
        .update(products)
        .set({
          stockQty: sql`COALESCE(${products.stockQty}, 0) + ${data.adjustment.qtyChange}`,
        })
        .where(eq(products.id, data.adjustment.productId));
    }

    return newAdjustment;
  });
}

