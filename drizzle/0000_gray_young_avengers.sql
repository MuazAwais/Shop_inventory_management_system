CREATE TABLE `branches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`branch_name_en` text(100),
	`branch_name_ur` text(100),
	`address_en` text,
	`address_ur` text,
	`phone` text(15)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name_en` text(100),
	`name_ur` text(100)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name_en` text(100),
	`name_ur` text(100)
);
--> statement-breakpoint
CREATE TABLE `credit_payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer,
	`amount` real,
	`payment_date` integer,
	`payment_method` text(50),
	`received_by` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`received_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(100),
	`phone` text(20),
	`cnic` text(15),
	`address` text,
	`credit_limit` real DEFAULT 0,
	`current_credit_balance` real DEFAULT 0,
	`loyalty_points` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `expense_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(100)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`branch_id` integer,
	`category_id` integer,
	`amount` real,
	`description` text,
	`expense_date` integer,
	`paid_to` text(150),
	`created_by` integer,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text(50),
	`barcode` text(50),
	`name_en` text(200),
	`name_ur` text(200),
	`brand_id` integer,
	`category_id` integer,
	`model_compatibility` text(255),
	`purchase_price` real,
	`selling_price` real,
	`wholesale_price` real,
	`gst_percent` real DEFAULT 17,
	`stock_qty` real DEFAULT 0,
	`min_stock_level` integer DEFAULT 5,
	`images` text,
	`status` text(20) DEFAULT 'active',
	`notes` text,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `purchase_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`purchase_id` integer,
	`product_id` integer,
	`qty` real,
	`unit_price` real,
	`gst_percent` real,
	`total_price` real,
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`branch_id` integer,
	`supplier_id` integer,
	`invoice_no` text(100),
	`purchase_date` integer,
	`subtotal` real,
	`gst_amount` real,
	`total_amount` real,
	`discount_amount` real DEFAULT 0,
	`paid_amount` real,
	`due_amount` real,
	`payment_method` text(50),
	`notes` text,
	`created_by` integer,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sale_id` integer,
	`product_id` integer,
	`qty` real,
	`unit_price` real,
	`discount_per_item` real DEFAULT 0,
	`gst_percent` real,
	`total_price` real,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`branch_id` integer,
	`customer_id` integer,
	`invoice_no` text(100),
	`sale_date` integer,
	`subtotal` real,
	`discount_amount` real DEFAULT 0,
	`gst_amount` real,
	`further_tax_amount` real DEFAULT 0,
	`total_amount` real,
	`paid_amount` real,
	`payment_method` text(50),
	`payment_details` text,
	`is_credit_sale` integer DEFAULT false,
	`fbr_invoice_number` integer,
	`created_by` integer,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shop_profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`shop_name_en` text(150),
	`shop_name_ur` text(150),
	`owner_name` text(100),
	`ntn` text(20),
	`strn` text(20),
	`cnic` text(15),
	`phone1` text(15),
	`phone2` text(15),
	`address_en` text,
	`address_ur` text,
	`fbr_pos_id` text(50),
	`logo_url` text(255)
);
--> statement-breakpoint
CREATE TABLE `stock_adjustments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`branch_id` integer,
	`product_id` integer,
	`qty_change` integer,
	`reason` text(50),
	`notes` text,
	`adjusted_by` integer,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`adjusted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(150),
	`contact_person` text(100),
	`phone` text(20),
	`cnic` text(15),
	`ntn` text(20),
	`address` text,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`branch_id` integer,
	`name` text(100),
	`username` text(50),
	`password_hash` text(255),
	`role` text(50) DEFAULT 'cashier',
	`phone` text(15),
	`is_active` integer DEFAULT true,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_phone_unique` ON `customers` (`phone`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_code_unique` ON `products` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);