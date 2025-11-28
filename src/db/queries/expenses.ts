import { db } from "@/db";
import { expenses, expenseCategories } from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

/**
 * Expense category queries
 */

export async function getAllExpenseCategories() {
  return await db.select().from(expenseCategories);
}

export async function getExpenseCategoryById(id: number) {
  const result = await db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createExpenseCategory(data: typeof expenseCategories.$inferInsert) {
  const [newCategory] = await db
    .insert(expenseCategories)
    .values(data)
    .returning();

  return newCategory;
}

export async function updateExpenseCategory(id: number, data: Partial<typeof expenseCategories.$inferInsert>) {
  const [updated] = await db
    .update(expenseCategories)
    .set(data)
    .where(eq(expenseCategories.id, id))
    .returning();

  return updated;
}

export async function deleteExpenseCategory(id: number) {
  await db
    .delete(expenseCategories)
    .where(eq(expenseCategories.id, id));

  return { success: true };
}

/**
 * Expense queries
 */

export async function getExpenseById(id: number) {
  const result = await db
    .select()
    .from(expenses)
    .where(eq(expenses.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getAllExpenses(limit: number = 100) {
  return await db
    .select()
    .from(expenses)
    .orderBy(desc(expenses.expenseDate))
    .limit(limit);
}

export async function getExpensesByBranch(branchId: number, limit: number = 100) {
  return await db
    .select()
    .from(expenses)
    .where(eq(expenses.branchId, branchId))
    .orderBy(desc(expenses.expenseDate))
    .limit(limit);
}

export async function getExpensesByCategory(categoryId: number, limit: number = 100) {
  return await db
    .select()
    .from(expenses)
    .where(eq(expenses.categoryId, categoryId))
    .orderBy(desc(expenses.expenseDate))
    .limit(limit);
}

export async function getExpensesWithFilters(filters: {
  branchId?: number;
  categoryId?: number;
  startDate?: number; // days since epoch
  endDate?: number; // days since epoch
  limit?: number;
}) {
  const conditions = [];

  if (filters.branchId) {
    conditions.push(eq(expenses.branchId, filters.branchId));
  }

  if (filters.categoryId) {
    conditions.push(eq(expenses.categoryId, filters.categoryId));
  }

  if (filters.startDate !== undefined) {
    conditions.push(gte(expenses.expenseDate, filters.startDate));
  }

  if (filters.endDate !== undefined) {
    conditions.push(lte(expenses.expenseDate, filters.endDate));
  }

  const baseQuery = db.select().from(expenses);

  if (conditions.length > 0) {
    const filteredQuery = baseQuery.where(and(...conditions));
    const orderedQuery = filteredQuery.orderBy(desc(expenses.expenseDate));
    
    if (filters.limit) {
      return await orderedQuery.limit(filters.limit);
    }
    
    return await orderedQuery;
  }

  const orderedQuery = baseQuery.orderBy(desc(expenses.expenseDate));
  
  if (filters.limit) {
    return await orderedQuery.limit(filters.limit);
  }
  
  return await orderedQuery;
}

export async function createExpense(data: typeof expenses.$inferInsert) {
  const [newExpense] = await db
    .insert(expenses)
    .values(data)
    .returning();

  return newExpense;
}

export async function updateExpense(id: number, data: Partial<typeof expenses.$inferInsert>) {
  const [updated] = await db
    .update(expenses)
    .set(data)
    .where(eq(expenses.id, id))
    .returning();

  return updated;
}

export async function deleteExpense(id: number) {
  await db
    .delete(expenses)
    .where(eq(expenses.id, id));

  return { success: true };
}

