import {
  getPurchaseById,
  getPurchaseWithItems,
  getPurchasesByBranch,
  createPurchaseWithItems,
  getPurchasesWithFilters,
  getAllPurchases,
} from "@/db/queries/purchases";
import { ProductService } from "./product.service";

/**
 * Purchase service
 * Business logic for purchase transactions
 */

export class PurchaseService {
  /**
   * Get purchase by ID
   */
  static async getPurchase(id: number) {
    return await getPurchaseById(id);
  }

  /**
   * Get purchase with items
   */
  static async getPurchaseWithItems(purchaseId: number) {
    return await getPurchaseWithItems(purchaseId);
  }

  /**
   * Get purchases by branch
   */
  static async getPurchasesByBranch(branchId: number, limit?: number) {
    return await getPurchasesByBranch(branchId, limit);
  }

  /**
   * Get purchases with filters
   */
  static async getPurchasesWithFilters(filters: {
    branchId?: number;
    supplierId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const filterParams: any = {
      branchId: filters.branchId,
      supplierId: filters.supplierId,
      limit: filters.limit || 100,
    };

    // Convert dates to days since epoch for purchaseDate (mode: "date")
    if (filters.startDate) {
      filterParams.startDate = Math.floor(filters.startDate.getTime() / 1000 / 86400);
    }
    if (filters.endDate) {
      filterParams.endDate = Math.floor(filters.endDate.getTime() / 1000 / 86400);
    }

    return await getPurchasesWithFilters(filterParams);
  }

  /**
   * Get all purchases
   */
  static async getAllPurchases(limit?: number) {
    return await getAllPurchases(limit);
  }

  /**
   * Create a new purchase with items and update stock in a single transaction
   */
  static async createPurchase(data: {
    branchId: number;
    supplierId: number;
    invoiceNo: string;
    purchaseDate: Date;
    items: Array<{
      productId: number;
      qty: number;
      unitPrice: number;
      gstPercent?: number;
    }>;
    discountAmount?: number;
    paymentMethod: string;
    paidAmount: number;
    notes?: string;
    createdBy: number;
  }) {
    // Validate products exist and get their GST percentages
    const productData = [];
    for (const item of data.items) {
      const product = await ProductService.getProduct(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      productData.push({
        product,
        item,
      });
    }

    // Calculate totals
    let subtotal = 0;
    let totalGst = 0;

    const purchaseItemsData = [];

    for (const { product, item } of productData) {
      const itemSubtotal = item.unitPrice * item.qty;
      const itemGst = itemSubtotal * ((item.gstPercent || product.gstPercent || 17) / 100);
      const itemTotal = itemSubtotal + itemGst;

      subtotal += itemSubtotal;
      totalGst += itemGst;

      purchaseItemsData.push({
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
        gstPercent: item.gstPercent || product.gstPercent || 17,
        totalPrice: itemTotal,
      });
    }

    const totalAmount = subtotal + totalGst;
    const dueAmount = totalAmount - (data.discountAmount || 0) - data.paidAmount;

    // Convert purchase date to integer (days since Unix epoch)
    // purchaseDate uses mode: "date" which stores days since epoch
    const purchaseDateInt = Math.floor(data.purchaseDate.getTime() / 1000 / 86400);

    // Create purchase with items and update stock in a single transaction
    return await createPurchaseWithItems({
      purchase: {
        branchId: data.branchId,
        supplierId: data.supplierId,
        invoiceNo: data.invoiceNo,
        purchaseDate: purchaseDateInt,
        subtotal,
        gstAmount: totalGst,
        totalAmount,
        discountAmount: data.discountAmount || 0,
        paidAmount: data.paidAmount,
        dueAmount,
        paymentMethod: data.paymentMethod,
        notes: data.notes || null,
        createdBy: data.createdBy,
      },
      items: purchaseItemsData,
    });
  }
}

