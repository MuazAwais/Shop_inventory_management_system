import {
  getProductById,
  getProductByCode,
  searchProducts,
  getLowStockProducts,
} from "@/db/queries/products";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Product service
 * Business logic for product management
 */

export class ProductService {
  /**
   * Get product by ID
   */
  static async getProduct(id: number) {
    return await getProductById(id);
  }

  /**
   * Get product by code
   */
  static async getProductByCode(code: string) {
    return await getProductByCode(code);
  }

  /**
   * Search products
   */
  static async search(query: string) {
    return await searchProducts(query);
  }

  /**
   * Get low stock products
   */
  static async getLowStock(minStockLevel?: number) {
    return await getLowStockProducts(minStockLevel);
  }

  /**
   * Update product stock
   */
  static async updateStock(productId: number, quantity: number) {
    const product = await getProductById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const newStock = (product.stockQty || 0) + quantity;

    await db
      .update(products)
      .set({ stockQty: newStock })
      .where(eq(products.id, productId));

    return { success: true, newStock };
  }

  /**
   * Create a new product
   */
  static async createProduct(data: {
    code: string;
    nameEn: string;
    nameUr?: string;
    brandId?: number;
    categoryId?: number;
    purchasePrice: number;
    sellingPrice: number;
    wholesalePrice?: number;
    gstPercent?: number;
    minStockLevel?: number;
  }) {
    const existing = await getProductByCode(data.code);
    if (existing) {
      throw new Error("Product code already exists");
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        code: data.code,
        nameEn: data.nameEn,
        nameUr: data.nameUr || null,
        brandId: data.brandId || null,
        categoryId: data.categoryId || null,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        wholesalePrice: data.wholesalePrice || null,
        gstPercent: data.gstPercent || 17,
        minStockLevel: data.minStockLevel || 5,
        stockQty: 0,
        status: "active",
      })
      .returning();

    return newProduct;
  }
}

