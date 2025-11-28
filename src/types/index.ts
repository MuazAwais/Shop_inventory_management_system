/**
 * Shared TypeScript types
 */

export type UserRole = "admin" | "manager" | "cashier" | "stock_keeper";

export type PaymentMethod =
  | "cash"
  | "card"
  | "jazzcash"
  | "easypaisa"
  | "bank_transfer"
  | "credit"
  | "cheque"
  | "mixed";

export type ProductStatus = "active" | "inactive";

export type StockAdjustmentReason =
  | "damage"
  | "lost"
  | "found"
  | "correction"
  | "sample"
  | "gift";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Re-export Result type for convenience
 */
export type { Result, Success, Failure } from "@/lib/result";

