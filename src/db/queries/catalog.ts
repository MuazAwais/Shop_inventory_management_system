import { db } from "@/db";
import { categories, brands, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Categories queries
 */

export async function getAllCategories() {
  return await db.select().from(categories);
}

export async function getCategoryById(id: number) {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createCategory(data: typeof categories.$inferInsert) {
  const [newCategory] = await db
    .insert(categories)
    .values(data)
    .returning();

  return newCategory;
}

export async function updateCategory(id: number, data: Partial<typeof categories.$inferInsert>) {
  const [updated] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();

  return updated;
}

export async function deleteCategory(id: number) {
  await db
    .delete(categories)
    .where(eq(categories.id, id));

  return { success: true };
}

/**
 * Brands queries
 */

export async function getAllBrands() {
  return await db.select().from(brands);
}

export async function getBrandById(id: number) {
  const result = await db
    .select()
    .from(brands)
    .where(eq(brands.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createBrand(data: typeof brands.$inferInsert) {
  const [newBrand] = await db
    .insert(brands)
    .values(data)
    .returning();

  return newBrand;
}

export async function updateBrand(id: number, data: Partial<typeof brands.$inferInsert>) {
  const [updated] = await db
    .update(brands)
    .set(data)
    .where(eq(brands.id, id))
    .returning();

  return updated;
}

export async function deleteBrand(id: number) {
  await db
    .delete(brands)
    .where(eq(brands.id, id));

  return { success: true };
}

/**
 * Products queries - additional functions
 */

export async function getAllProducts() {
  return await db.select().from(products);
}

export async function createProduct(data: typeof products.$inferInsert) {
  const [newProduct] = await db
    .insert(products)
    .values(data)
    .returning();

  return newProduct;
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const [updated] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, id))
    .returning();

  return updated;
}

export async function deleteProduct(id: number) {
  await db
    .delete(products)
    .where(eq(products.id, id));

  return { success: true };
}

export async function toggleProductStatus(id: number, status: "active" | "inactive") {
  const [updated] = await db
    .update(products)
    .set({ status })
    .where(eq(products.id, id))
    .returning();

  return updated;
}

