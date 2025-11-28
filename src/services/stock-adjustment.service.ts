import {
  getStockAdjustmentById,
  getAllStockAdjustments,
  getStockAdjustmentsByBranch,
  getStockAdjustmentsByProduct,
  getStockAdjustmentsWithFilters,
  createStockAdjustment,
} from "@/db/queries/stock-adjustments";
import { ProductService } from "./product.service";

/**
 * Stock adjustment service
 * Business logic for stock adjustments
 */

export class StockAdjustmentService {
  /**
   * Get stock adjustment by ID
   */
  static async getStockAdjustment(id: number) {
    return await getStockAdjustmentById(id);
  }

  /**
   * Get all stock adjustments
   */
  static async getAllStockAdjustments(limit?: number) {
    return await getAllStockAdjustments(limit);
  }

  /**
   * Get stock adjustments by branch
   */
  static async getStockAdjustmentsByBranch(branchId: number, limit?: number) {
    return await getStockAdjustmentsByBranch(branchId, limit);
  }

  /**
   * Get stock adjustments by product
   */
  static async getStockAdjustmentsByProduct(productId: number, limit?: number) {
    return await getStockAdjustmentsByProduct(productId, limit);
  }

  /**
   * Get stock adjustments with filters
   */
  static async getStockAdjustmentsWithFilters(filters: {
    branchId?: number;
    productId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const filterParams: any = {
      branchId: filters.branchId,
      productId: filters.productId,
      limit: filters.limit || 100,
    };

    // Convert dates to Unix timestamps
    if (filters.startDate) {
      filterParams.startDate = Math.floor(filters.startDate.getTime() / 1000);
    }
    if (filters.endDate) {
      filterParams.endDate = Math.floor(filters.endDate.getTime() / 1000);
    }

    return await getStockAdjustmentsWithFilters(filterParams);
  }

  /**
   * Create a new stock adjustment with stock update in a single transaction
   */
  static async createStockAdjustment(data: {
    branchId?: number;
    productId: number;
    qtyChange: number;
    reason: string;
    notes?: string;
    adjustedBy: number;
  }) {
    // Validate product exists
    const product = await ProductService.getProduct(data.productId);
    if (!product) {
      throw new Error(`Product ${data.productId} not found`);
    }

    // Validate reason is one of the allowed values
    const allowedReasons = ["damage", "lost", "found", "correction", "sample", "gift"];
    if (!allowedReasons.includes(data.reason)) {
      throw new Error(`Invalid reason. Must be one of: ${allowedReasons.join(", ")}`);
    }

    // Create adjustment with stock update in transaction
    return await createStockAdjustment({
      adjustment: {
        branchId: data.branchId || null,
        productId: data.productId,
        qtyChange: data.qtyChange,
        reason: data.reason,
        notes: data.notes || null,
        adjustedBy: data.adjustedBy,
        createdAt: Math.floor(Date.now() / 1000), // Unix timestamp
      },
    });
  }
}

