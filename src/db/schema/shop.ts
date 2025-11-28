import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Shop Management System Schema
 * Converted from MySQL to Drizzle ORM SQLite format
 */

// Shop Profile Table
export const shopProfile = sqliteTable("shop_profile", {
  id: integer("id").primaryKey(),
  shopNameEn: text("shop_name_en", { length: 150 }),
  shopNameUr: text("shop_name_ur", { length: 150 }),
  ownerName: text("owner_name", { length: 100 }),
  ntn: text("ntn", { length: 20 }),
  strn: text("strn", { length: 20 }),
  cnic: text("cnic", { length: 15 }),
  phone1: text("phone1", { length: 15 }),
  phone2: text("phone2", { length: 15 }),
  addressEn: text("address_en"),
  addressUr: text("address_ur"),
  fbrPosId: text("fbr_pos_id", { length: 50 }),
  logoUrl: text("logo_url", { length: 255 }),
});

// Branches Table
export const branches = sqliteTable("branches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  branchNameEn: text("branch_name_en", { length: 100 }),
  branchNameUr: text("branch_name_ur", { length: 100 }),
  addressEn: text("address_en"),
  addressUr: text("address_ur"),
  phone: text("phone", { length: 15 }),
});

// Users Table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  branchId: integer("branch_id").references(() => branches.id),
  name: text("name", { length: 100 }),
  username: text("username", { length: 50 }).unique(),
  passwordHash: text("password_hash", { length: 255 }),
  role: text("role", { length: 50 }).default("cashier"), // admin, manager, cashier, stock_keeper
  phone: text("phone", { length: 15 }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

// Categories Table
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameEn: text("name_en", { length: 100 }),
  nameUr: text("name_ur", { length: 100 }),
});

// Brands Table
export const brands = sqliteTable("brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameEn: text("name_en", { length: 100 }),
  nameUr: text("name_ur", { length: 100 }),
});

// Products Table
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code", { length: 50 }).unique(),
  barcode: text("barcode", { length: 50 }),
  nameEn: text("name_en", { length: 200 }),
  nameUr: text("name_ur", { length: 200 }),
  brandId: integer("brand_id").references(() => brands.id),
  categoryId: integer("category_id").references(() => categories.id),
  modelCompatibility: text("model_compatibility", { length: 255 }),
  purchasePrice: real("purchase_price"),
  sellingPrice: real("selling_price"),
  wholesalePrice: real("wholesale_price"),
  gstPercent: real("gst_percent").default(17),
  stockQty: real("stock_qty").default(0),
  minStockLevel: integer("min_stock_level").default(5),
  images: text("images", { mode: "json" }), // JSON field
  status: text("status", { length: 20 }).default("active"), // active, inactive
  notes: text("notes"),
});

// Suppliers Table
export const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 150 }),
  contactPerson: text("contact_person", { length: 100 }),
  phone: text("phone", { length: 20 }),
  cnic: text("cnic", { length: 15 }),
  ntn: text("ntn", { length: 20 }),
  address: text("address"),
  notes: text("notes"),
});

// Purchases Table
export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  branchId: integer("branch_id").references(() => branches.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  invoiceNo: text("invoice_no", { length: 100 }),
  purchaseDate: integer("purchase_date", { mode: "date" }), // Date stored as integer
  subtotal: real("subtotal"),
  gstAmount: real("gst_amount"),
  totalAmount: real("total_amount"),
  discountAmount: real("discount_amount").default(0),
  paidAmount: real("paid_amount"),
  dueAmount: real("due_amount"),
  paymentMethod: text("payment_method", { length: 50 }), // cash, bank_transfer, jazzcash, easypaisa, cheque, credit
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
});

// Purchase Items Table
export const purchaseItems = sqliteTable("purchase_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  productId: integer("product_id").references(() => products.id),
  qty: real("qty"),
  unitPrice: real("unit_price"),
  gstPercent: real("gst_percent"),
  totalPrice: real("total_price"),
});

// Customers Table
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }),
  phone: text("phone", { length: 20 }).unique(),
  cnic: text("cnic", { length: 15 }),
  address: text("address"),
  creditLimit: real("credit_limit").default(0),
  currentCreditBalance: real("current_credit_balance").default(0),
  loyaltyPoints: integer("loyalty_points").default(0),
});

// Sales Table
export const sales = sqliteTable("sales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  branchId: integer("branch_id").references(() => branches.id),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name", { length: 200 }), // Optional customer name for receipt printing
  invoiceNo: text("invoice_no", { length: 100 }),
  saleDate: integer("sale_date", { mode: "timestamp" }), // DateTime stored as timestamp
  subtotal: real("subtotal"),
  discountAmount: real("discount_amount").default(0),
  gstAmount: real("gst_amount"),
  furtherTaxAmount: real("further_tax_amount").default(0),
  totalAmount: real("total_amount"),
  paidAmount: real("paid_amount"),
  paymentMethod: text("payment_method", { length: 50 }), // cash, card, jazzcash, easypaisa, bank_transfer, credit, mixed
  paymentDetails: text("payment_details", { mode: "json" }), // JSON field
  isCreditSale: integer("is_credit_sale", { mode: "boolean" }).default(false),
  fbrInvoiceNumber: integer("fbr_invoice_number"),
  createdBy: integer("created_by").references(() => users.id),
});

// Sale Items Table
export const saleItems = sqliteTable("sale_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saleId: integer("sale_id").references(() => sales.id),
  productId: integer("product_id").references(() => products.id),
  qty: real("qty"),
  unitPrice: real("unit_price"),
  discountPerItem: real("discount_per_item").default(0),
  gstPercent: real("gst_percent"),
  totalPrice: real("total_price"),
});

// Credit Payments Table
export const creditPayments = sqliteTable("credit_payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id),
  amount: real("amount"),
  paymentDate: integer("payment_date", { mode: "timestamp" }), // DateTime stored as timestamp
  paymentMethod: text("payment_method", { length: 50 }), // cash, jazzcash, easypaisa, bank_transfer
  receivedBy: integer("received_by").references(() => users.id),
});

// Stock Adjustments Table
export const stockAdjustments = sqliteTable("stock_adjustments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  branchId: integer("branch_id").references(() => branches.id),
  productId: integer("product_id").references(() => products.id),
  qtyChange: integer("qty_change"),
  reason: text("reason", { length: 50 }), // damage, lost, found, correction, sample, gift
  notes: text("notes"),
  adjustedBy: integer("adjusted_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Expense Categories Table
export const expenseCategories = sqliteTable("expense_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }),
});

// Expenses Table
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  branchId: integer("branch_id").references(() => branches.id),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  amount: real("amount"),
  description: text("description"),
  expenseDate: integer("expense_date", { mode: "date" }), // Date stored as integer
  paidTo: text("paid_to", { length: 150 }),
  createdBy: integer("created_by").references(() => users.id),
});

