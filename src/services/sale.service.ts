import {
  getSaleById,
  getSaleWithItems,
  getSalesByBranch,
  getSalesByDateRange,
} from "@/db/queries/sales";
import { ProductService } from "./product.service";
import { db } from "@/db";
import { sales, saleItems, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getBranchById } from "@/db/queries/shop";
import { getUserById } from "@/db/queries/users";
import { getCustomerById } from "@/db/queries/customers";

/**
 * Sale service
 * Business logic for sales transactions
 */

export class SaleService {
  /**
   * Get sale by ID
   */
  static async getSale(id: number) {
    return await getSaleById(id);
  }

  /**
   * Get sale with items
   */
  static async getSaleWithItems(saleId: number) {
    return await getSaleWithItems(saleId);
  }

  /**
   * Get sales by branch
   */
  static async getSalesByBranch(branchId: number, limit?: number) {
    return await getSalesByBranch(branchId, limit);
  }

  /**
   * Get sales by date range
   */
  static async getSalesByDateRange(
    branchId: number,
    startDate: Date,
    endDate: Date
  ) {
    return await getSalesByDateRange(branchId, startDate, endDate);
  }

  /**
   * Create a new sale
   */
  static async createSale(data: {
    branchId: number;
    customerId?: number;
    invoiceNo: string;
    items: Array<{
      productId: number;
      qty: number;
      unitPrice: number;
      discountPerItem?: number;
      gstPercent?: number;
    }>;
    paymentMethod: string;
    paymentDetails?: unknown;
    isCreditSale?: boolean;
    fbrInvoiceNumber?: number;
    createdBy: number;
  }) {
    // Calculate totals in memory first
    let subtotal = 0;
    let totalGst = 0;
    let totalDiscount = 0;

    const saleItemsData: Array<{
      productId: number;
      qty: number;
      unitPrice: number;
      discountPerItem: number;
      gstPercent: number;
      totalPrice: number;
    }> = [];

    for (const item of data.items) {
      const product = await ProductService.getProduct(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      // Check stock availability before creating the sale
      if ((product.stockQty || 0) < item.qty) {
        throw new Error(`Insufficient stock for product ${product.code}`);
      }

      const itemSubtotal = item.unitPrice * item.qty;
      const itemDiscount = (item.discountPerItem || 0) * item.qty;
      const gstPercent = item.gstPercent || product.gstPercent || 17;
      const itemGst = (itemSubtotal - itemDiscount) * (gstPercent / 100);
      const itemTotal = itemSubtotal - itemDiscount + itemGst;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      totalGst += itemGst;

      saleItemsData.push({
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
        discountPerItem: item.discountPerItem || 0,
        gstPercent,
        totalPrice: itemTotal,
      });
    }

    const totalAmount = subtotal - totalDiscount + totalGst;
    const paidAmount = data.isCreditSale ? 0 : totalAmount;

    // Validate foreign keys exist before transaction
    const branch = await getBranchById(data.branchId);
    if (!branch) {
      throw new Error(`Branch with ID ${data.branchId} not found`);
    }

    const user = await getUserById(data.createdBy);
    if (!user) {
      throw new Error(`User with ID ${data.createdBy} not found`);
    }

    if (data.customerId) {
      const customer = await getCustomerById(data.customerId);
      if (!customer) {
        throw new Error(`Customer with ID ${data.customerId} not found`);
      }
    }

    // Persist sale, items, and stock updates in a single transaction
    let newSaleId: number;

    await db.transaction(async (tx) => {
      const [newSale] = await tx
        .insert(sales)
        .values({
          branchId: data.branchId,
          customerId: data.customerId || null,
          invoiceNo: data.invoiceNo,
          saleDate: new Date(), // Drizzle timestamp mode expects a Date object
          subtotal,
          discountAmount: totalDiscount,
          gstAmount: totalGst,
          totalAmount,
          paidAmount,
          paymentMethod: data.paymentMethod,
          paymentDetails: data.paymentDetails || null,
          isCreditSale: data.isCreditSale || false,
          fbrInvoiceNumber: data.fbrInvoiceNumber ?? null,
          createdBy: data.createdBy,
        })
        .returning();

      newSaleId = newSale.id;

      for (const item of saleItemsData) {
        await tx.insert(saleItems).values({
          saleId: newSale.id,
          ...item,
        });

        // Decrement product stock atomically
        await tx
          .update(products)
          .set({ stockQty: sql`${products.stockQty} - ${item.qty}` })
          .where(eq(products.id, item.productId));
      }
    });

    return await getSaleWithItems(newSaleId!);
  }
}

