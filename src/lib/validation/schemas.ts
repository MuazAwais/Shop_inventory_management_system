/**
 * Common validation schemas for the application
 */

import * as yup from "yup";
import { UserRole, PaymentMethod, ProductStatus } from "@/types";

/**
 * User validation schemas
 */
export const userSchemas = {
  login: yup.object({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  }),

  create: yup.object({
    username: yup
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be less than 50 characters")
      .required("Username is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    name: yup.string().required("Name is required"),
    role: yup
      .string()
      .oneOf(["admin", "manager", "cashier", "stock_keeper"] as UserRole[])
      .required("Role is required"),
    branchId: yup.number().integer().positive().nullable(),
    phone: yup.string().nullable(),
  }),

  updatePassword: yup.object({
    currentPassword: yup.string().required("Current password is required"),
    newPassword: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
  }),
};

/**
 * Shop Profile validation schemas
 */
export const shopProfileSchemas = {
  update: yup.object({
    shopNameEn: yup.string().max(150).nullable(),
    shopNameUr: yup.string().max(150).nullable(),
    ownerName: yup.string().max(100).nullable(),
    ntn: yup.string().max(20).nullable(),
    strn: yup.string().max(20).nullable(),
    cnic: yup.string().max(15).nullable(),
    phone1: yup.string().max(15).nullable(),
    phone2: yup.string().max(15).nullable(),
    addressEn: yup.string().nullable(),
    addressUr: yup.string().nullable(),
    fbrPosId: yup.string().max(50).nullable(),
    logoUrl: yup.string().max(255).url("Must be a valid URL").nullable(),
  }),
};

/**
 * Branch validation schemas
 */
export const branchSchemas = {
  create: yup.object({
    branchNameEn: yup.string().max(100).required("Branch name (English) is required"),
    branchNameUr: yup.string().max(100).nullable(),
    addressEn: yup.string().nullable(),
    addressUr: yup.string().nullable(),
    phone: yup.string().max(15).nullable(),
  }),

  update: yup.object({
    branchNameEn: yup.string().max(100),
    branchNameUr: yup.string().max(100).nullable(),
    addressEn: yup.string().nullable(),
    addressUr: yup.string().nullable(),
    phone: yup.string().max(15).nullable(),
  }),
};

/**
 * Product validation schemas
 */
export const productSchemas = {
  create: yup.object({
    code: yup
      .string()
      .required("Product code is required")
      .max(50, "Code must be less than 50 characters"),
    barcode: yup.string().max(50).nullable(),
    nameEn: yup.string().required("Product name (English) is required").max(200),
    nameUr: yup.string().max(200).nullable(),
    brandId: yup.number().integer().positive().nullable(),
    categoryId: yup.number().integer().positive().nullable(),
    modelCompatibility: yup.string().max(255).nullable(),
    purchasePrice: yup.number().min(0).required("Purchase price is required"),
    sellingPrice: yup.number().min(0).required("Selling price is required"),
    wholesalePrice: yup.number().min(0).nullable(),
    gstPercent: yup.number().min(0).max(100).default(17),
    stockQty: yup.number().min(0).default(0),
    minStockLevel: yup.number().integer().min(0).default(5),
    status: yup
      .string()
      .oneOf(["active", "inactive"] as ProductStatus[])
      .default("active"),
    notes: yup.string().nullable(),
  }),

  update: yup.object({
    nameEn: yup.string().max(200),
    nameUr: yup.string().max(200).nullable(),
    purchasePrice: yup.number().min(0),
    sellingPrice: yup.number().min(0),
    wholesalePrice: yup.number().min(0).nullable(),
    gstPercent: yup.number().min(0).max(100),
    stockQty: yup.number().min(0),
    minStockLevel: yup.number().integer().min(0),
    status: yup.string().oneOf(["active", "inactive"] as ProductStatus[]),
    notes: yup.string().nullable(),
  }),

  updateStock: yup.object({
    quantity: yup.number().required("Quantity is required"),
  }),
};

/**
 * Sale validation schemas
 */
export const saleSchemas = {
  create: yup.object({
    branchId: yup.number().integer().positive().required("Branch ID is required"),
    customerId: yup.number().integer().positive().nullable(),
    invoiceNo: yup.string().required("Invoice number is required"),
    items: yup
      .array()
      .of(
        yup.object({
          productId: yup.number().integer().positive().required(),
          qty: yup.number().positive().required(),
          unitPrice: yup.number().positive().required(),
          discountPerItem: yup.number().min(0).default(0),
          gstPercent: yup.number().min(0).max(100),
        })
      )
      .min(1, "At least one item is required")
      .required("Items are required"),
    paymentMethod: yup
      .string()
      .oneOf([
        "cash",
        "card",
        "jazzcash",
        "easypaisa",
        "bank_transfer",
        "credit",
        "mixed",
      ] as PaymentMethod[])
      .required("Payment method is required"),
    paymentDetails: yup.object().nullable(),
    isCreditSale: yup.boolean().default(false),
    fbrInvoiceNumber: yup.number().integer().nullable(),
  }),
};

/**
 * Purchase validation schemas
 */
export const purchaseSchemas = {
  create: yup.object({
    branchId: yup.number().integer().positive().required("Branch ID is required"),
    supplierId: yup.number().integer().positive().required("Supplier ID is required"),
    invoiceNo: yup.string().required("Invoice number is required"),
    purchaseDate: yup.date().required("Purchase date is required"),
    items: yup
      .array()
      .of(
        yup.object({
          productId: yup.number().integer().positive().required(),
          qty: yup.number().positive().required(),
          unitPrice: yup.number().positive().required(),
          gstPercent: yup.number().min(0).max(100),
        })
      )
      .min(1, "At least one item is required")
      .required("Items are required"),
    discountAmount: yup.number().min(0).default(0),
    paymentMethod: yup
      .string()
      .oneOf([
        "cash",
        "bank_transfer",
        "jazzcash",
        "easypaisa",
        "cheque",
        "credit",
      ] as PaymentMethod[])
      .required("Payment method is required"),
    paidAmount: yup.number().min(0).required("Paid amount is required"),
    notes: yup.string().nullable(),
  }),
};

/**
 * Category validation schemas
 */
export const categorySchemas = {
  create: yup.object({
    nameEn: yup.string().required("Category name (English) is required").max(100),
    nameUr: yup.string().max(100).nullable(),
  }),

  update: yup.object({
    nameEn: yup.string().max(100),
    nameUr: yup.string().max(100).nullable(),
  }),
};

/**
 * Brand validation schemas
 */
export const brandSchemas = {
  create: yup.object({
    nameEn: yup.string().required("Brand name (English) is required").max(100),
    nameUr: yup.string().max(100).nullable(),
  }),

  update: yup.object({
    nameEn: yup.string().max(100),
    nameUr: yup.string().max(100).nullable(),
  }),
};

/**
 * Supplier validation schemas
 */
export const supplierSchemas = {
  create: yup.object({
    name: yup.string().required("Supplier name is required").max(150),
    contactPerson: yup.string().max(100).nullable(),
    phone: yup.string().max(20).nullable(),
    cnic: yup.string().max(15).nullable(),
    ntn: yup.string().max(20).nullable(),
    address: yup.string().nullable(),
    notes: yup.string().nullable(),
  }),

  update: yup.object({
    name: yup.string().max(150),
    contactPerson: yup.string().max(100).nullable(),
    phone: yup.string().max(20).nullable(),
    cnic: yup.string().max(15).nullable(),
    ntn: yup.string().max(20).nullable(),
    address: yup.string().nullable(),
    notes: yup.string().nullable(),
  }),
};

/**
 * Customer validation schemas
 */
export const customerSchemas = {
  create: yup.object({
    name: yup.string().required("Name is required").max(100),
    phone: yup.string().max(20).nullable(),
    cnic: yup.string().max(15).nullable(),
    address: yup.string().nullable(),
    creditLimit: yup.number().min(0).default(0),
  }),

  update: yup.object({
    name: yup.string().max(100),
    phone: yup.string().max(20).nullable(),
    cnic: yup.string().max(15).nullable(),
    address: yup.string().nullable(),
    creditLimit: yup.number().min(0),
  }),
};

/**
 * Stock adjustment validation schemas
 */
export const stockAdjustmentSchemas = {
  create: yup.object({
    branchId: yup.number().integer().positive().nullable(),
    productId: yup.number().integer().positive().required("Product ID is required"),
    qtyChange: yup
      .number()
      .integer()
      .required("Quantity change is required")
      .test("not-zero", "Quantity change cannot be zero", (value) => value !== 0),
    reason: yup
      .string()
      .required("Reason is required")
      .max(50)
      .oneOf(
        ["damage", "lost", "found", "correction", "sample", "gift"],
        "Invalid reason. Must be one of: damage, lost, found, correction, sample, gift"
      ),
    notes: yup.string().nullable(),
  }),
};

/**
 * Expense category validation schemas
 */
export const expenseCategorySchemas = {
  create: yup.object({
    name: yup.string().required("Category name is required").max(100),
  }),

  update: yup.object({
    name: yup.string().max(100),
  }),
};

/**
 * Expense validation schemas
 */
export const expenseSchemas = {
  create: yup.object({
    branchId: yup.number().integer().positive().required("Branch ID is required"),
    categoryId: yup.number().integer().positive().required("Category ID is required"),
    amount: yup.number().min(0).required("Amount is required"),
    description: yup.string().nullable(),
    expenseDate: yup.date().required("Expense date is required"),
    paidTo: yup.string().max(150).nullable(),
  }),

  update: yup.object({
    branchId: yup.number().integer().positive(),
    categoryId: yup.number().integer().positive(),
    amount: yup.number().min(0),
    description: yup.string().nullable(),
    expenseDate: yup.date(),
    paidTo: yup.string().max(150).nullable(),
  }),
};
