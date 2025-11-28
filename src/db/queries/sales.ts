import { db } from "@/db";
import { sales, saleItems, products, customers } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getProductById } from "./products";
import { getCustomerById } from "./customers";
import { getBranchById, getShopProfile } from "./shop";
import { getUserById } from "./users";

/**
 * Sales queries
 */

export async function getSaleById(id: number) {
  const result = await db
    .select()
    .from(sales)
    .where(eq(sales.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getSaleWithItems(saleId: number) {
  const sale = await getSaleById(saleId);
  if (!sale) return null;

  const items = await db
    .select()
    .from(saleItems)
    .where(eq(saleItems.saleId, saleId));

  return { ...sale, items };
}

/**
 * Get complete receipt data for a sale
 * Includes sale, items with product details, customer, shop profile, branch, and user info
 */
export async function getReceiptData(saleId: number) {
  const sale = await getSaleById(saleId);
  if (!sale) return null;

  // Get sale items with product details
  const saleItemsData = await db
    .select()
    .from(saleItems)
    .where(eq(saleItems.saleId, saleId));

  const itemsWithProducts = await Promise.all(
    saleItemsData.map(async (item) => {
      const product = await getProductById(item.productId);
      return {
        ...item,
        product: product || null,
      };
    })
  );

  // Get related data
  const [customer, branch, shopProfile, user] = await Promise.all([
    sale.customerId ? getCustomerById(sale.customerId) : Promise.resolve(null),
    sale.branchId ? getBranchById(sale.branchId) : Promise.resolve(null),
    getShopProfile(),
    sale.createdBy ? getUserById(sale.createdBy) : Promise.resolve(null),
  ]);

  return {
    sale,
    items: itemsWithProducts,
    customer,
    branch,
    shopProfile,
    user: user ? { id: user.id, name: user.name, username: user.username } : null,
  };
}

export async function getSalesByBranch(branchId: number, limit: number = 50) {
  return await db
    .select()
    .from(sales)
    .where(eq(sales.branchId, branchId))
    .orderBy(desc(sales.saleDate))
    .limit(limit);
}

export async function getSalesByDateRange(
  branchId: number,
  startDate: Date,
  endDate: Date
) {
  return await db
    .select()
    .from(sales)
    .where(
      and(
        eq(sales.branchId, branchId),
        gte(sales.saleDate, Math.floor(startDate.getTime() / 1000)),
        lte(sales.saleDate, Math.floor(endDate.getTime() / 1000))
      )
    )
    .orderBy(desc(sales.saleDate));
}

export async function getSalesByCustomer(customerId: number) {
  return await db
    .select()
    .from(sales)
    .where(eq(sales.customerId, customerId))
    .orderBy(desc(sales.saleDate));
}

