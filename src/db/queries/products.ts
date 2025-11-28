import { db } from "@/db";
import { products, categories, brands } from "@/db/schema";
import { eq, and, like, sql } from "drizzle-orm";

/**
 * Product queries
 */

export async function getProductById(id: number) {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getProductByCode(code: string) {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.code, code))
    .limit(1);

  return result[0] || null;
}

export async function getProductsByCategory(categoryId: number) {
  return await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, categoryId), eq(products.status, "active")));
}

export async function searchProducts(query: string) {
  return await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, "active"),
        sql`(${products.nameEn} LIKE ${`%${query}%`} OR ${products.code} LIKE ${`%${query}%`} OR ${products.barcode} LIKE ${`%${query}%`})`
      )
    );
}

export async function getLowStockProducts(minStockLevel: number = 5) {
  return await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, "active"),
        sql`${products.stockQty} <= ${products.minStockLevel}`
      )
    );
}

// Categories and Brands queries moved to catalog.ts

