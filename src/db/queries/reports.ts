import { db } from "@/db";
import { sales, purchases, products, suppliers, expenses, expenseCategories, branches } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

/**
 * Report queries
 * Lightweight server-side queries for reporting
 */

/**
 * Sales report by branch and payment method
 */
export async function getSalesReportByBranchAndPaymentMethod(filters: {
  branchId?: number;
  startDate?: number; // Unix timestamp
  endDate?: number; // Unix timestamp
}) {
  const conditions = [];

  if (filters.branchId) {
    conditions.push(eq(sales.branchId, filters.branchId));
  }

  if (filters.startDate !== undefined) {
    conditions.push(gte(sales.saleDate, filters.startDate));
  }

  if (filters.endDate !== undefined) {
    conditions.push(lte(sales.saleDate, filters.endDate));
  }

  let query = db
    .select({
      branchId: sales.branchId,
      paymentMethod: sales.paymentMethod,
      totalAmount: sql<number>`SUM(${sales.totalAmount})`.as("total_amount"),
      totalSales: sql<number>`COUNT(*)`.as("total_sales"),
      paidAmount: sql<number>`SUM(${sales.paidAmount})`.as("paid_amount"),
    })
    .from(sales)
    .groupBy(sales.branchId, sales.paymentMethod);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query;
}

/**
 * Daily sales summary
 */
export async function getDailySalesSummary(filters: {
  branchId?: number;
  startDate?: number; // Unix timestamp
  endDate?: number; // Unix timestamp
}) {
  const conditions = [];

  if (filters.branchId) {
    conditions.push(eq(sales.branchId, filters.branchId));
  }

  if (filters.startDate !== undefined) {
    conditions.push(gte(sales.saleDate, filters.startDate));
  }

  if (filters.endDate !== undefined) {
    conditions.push(lte(sales.saleDate, filters.endDate));
  }

  let query = db
    .select({
      date: sql<string>`DATE(${sales.saleDate}, 'unixepoch')`.as("date"),
      branchId: sales.branchId,
      totalAmount: sql<number>`SUM(${sales.totalAmount})`.as("total_amount"),
      totalSales: sql<number>`COUNT(*)`.as("total_sales"),
      paidAmount: sql<number>`SUM(${sales.paidAmount})`.as("paid_amount"),
    })
    .from(sales)
    .groupBy(sql`DATE(${sales.saleDate}, 'unixepoch')`, sales.branchId)
    .orderBy(desc(sql`DATE(${sales.saleDate}, 'unixepoch')`));

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query;
}

/**
 * Stock level report with low-stock alerts
 */
export async function getStockLevelReport(filters: {
  branchId?: number; // Not used in products, but kept for consistency
  minStockLevel?: number;
}) {
  const conditions = [];

  // Filter active products only
  conditions.push(eq(products.status, "active"));

  let query = db
    .select({
      id: products.id,
      code: products.code,
      nameEn: products.nameEn,
      nameUr: products.nameUr,
      stockQty: products.stockQty,
      minStockLevel: products.minStockLevel,
      isLowStock: sql<boolean>`COALESCE(${products.stockQty}, 0) <= COALESCE(${products.minStockLevel}, 5)`.as("is_low_stock"),
    })
    .from(products)
    .where(and(...conditions))
    .orderBy(products.nameEn);

  // If minStockLevel filter is provided, only show low stock items
  if (filters.minStockLevel !== undefined) {
    query = query.having(sql`COALESCE(${products.stockQty}, 0) <= ${filters.minStockLevel}`) as any;
  }

  return await query;
}

/**
 * Low stock alerts
 */
export async function getLowStockAlerts() {
  return await db
    .select({
      id: products.id,
      code: products.code,
      nameEn: products.nameEn,
      nameUr: products.nameUr,
      stockQty: products.stockQty,
      minStockLevel: products.minStockLevel,
      difference: sql<number>`COALESCE(${products.stockQty}, 0) - COALESCE(${products.minStockLevel}, 5)`.as("difference"),
    })
    .from(products)
    .where(
      and(
        eq(products.status, "active"),
        sql`COALESCE(${products.stockQty}, 0) <= COALESCE(${products.minStockLevel}, 5)`
      )
    )
    .orderBy(products.stockQty);
}

/**
 * Purchase summary by supplier
 */
export async function getPurchaseSummaryBySupplier(filters: {
  startDate?: number; // days since epoch
  endDate?: number; // days since epoch
}) {
  const conditions = [];

  if (filters.startDate !== undefined) {
    conditions.push(gte(purchases.purchaseDate, filters.startDate));
  }

  if (filters.endDate !== undefined) {
    conditions.push(lte(purchases.purchaseDate, filters.endDate));
  }

  let query = db
    .select({
      supplierId: purchases.supplierId,
      totalPurchases: sql<number>`COUNT(*)`.as("total_purchases"),
      totalAmount: sql<number>`SUM(${purchases.totalAmount})`.as("total_amount"),
      paidAmount: sql<number>`SUM(${purchases.paidAmount})`.as("paid_amount"),
      dueAmount: sql<number>`SUM(${purchases.dueAmount})`.as("due_amount"),
    })
    .from(purchases)
    .groupBy(purchases.supplierId);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query;
}

/**
 * Purchase summary by branch
 */
export async function getPurchaseSummaryByBranch(filters: {
  startDate?: number; // days since epoch
  endDate?: number; // days since epoch
}) {
  const conditions = [];

  if (filters.startDate !== undefined) {
    conditions.push(gte(purchases.purchaseDate, filters.startDate));
  }

  if (filters.endDate !== undefined) {
    conditions.push(lte(purchases.purchaseDate, filters.endDate));
  }

  let query = db
    .select({
      branchId: purchases.branchId,
      totalPurchases: sql<number>`COUNT(*)`.as("total_purchases"),
      totalAmount: sql<number>`SUM(${purchases.totalAmount})`.as("total_amount"),
      paidAmount: sql<number>`SUM(${purchases.paidAmount})`.as("paid_amount"),
      dueAmount: sql<number>`SUM(${purchases.dueAmount})`.as("due_amount"),
    })
    .from(purchases)
    .groupBy(purchases.branchId);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query;
}

/**
 * Expense summary by category
 */
export async function getExpenseSummaryByCategory(filters: {
  branchId?: number;
  startDate?: number; // days since epoch
  endDate?: number; // days since epoch
}) {
  const conditions = [];

  if (filters.branchId) {
    conditions.push(eq(expenses.branchId, filters.branchId));
  }

  if (filters.startDate !== undefined) {
    conditions.push(gte(expenses.expenseDate, filters.startDate));
  }

  if (filters.endDate !== undefined) {
    conditions.push(lte(expenses.expenseDate, filters.endDate));
  }

  let query = db
    .select({
      categoryId: expenses.categoryId,
      totalExpenses: sql<number>`COUNT(*)`.as("total_expenses"),
      totalAmount: sql<number>`SUM(${expenses.amount})`.as("total_amount"),
    })
    .from(expenses)
    .groupBy(expenses.categoryId);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query;
}

/**
 * Expense summary by branch
 */
export async function getExpenseSummaryByBranch(filters: {
  categoryId?: number;
  startDate?: number; // days since epoch
  endDate?: number; // days since epoch
}) {
  const conditions = [];

  if (filters.categoryId) {
    conditions.push(eq(expenses.categoryId, filters.categoryId));
  }

  if (filters.startDate !== undefined) {
    conditions.push(gte(expenses.expenseDate, filters.startDate));
  }

  if (filters.endDate !== undefined) {
    conditions.push(lte(expenses.expenseDate, filters.endDate));
  }

  let query = db
    .select({
      branchId: expenses.branchId,
      totalExpenses: sql<number>`COUNT(*)`.as("total_expenses"),
      totalAmount: sql<number>`SUM(${expenses.amount})`.as("total_amount"),
    })
    .from(expenses)
    .groupBy(expenses.branchId);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query;
}

