-- CREATE TABLE `shop_profile` (
--   `id` int PRIMARY KEY,
--   `shop_name_en` varchar(150),
--   `shop_name_ur` varchar(150),
--   `owner_name` varchar(100),
--   `ntn` varchar(20),
--   `strn` varchar(20),
--   `cnic` varchar(15),
--   `phone1` varchar(15),
--   `phone2` varchar(15),
--   `address_en` text,
--   `address_ur` text,
--   `fbr_pos_id` varchar(50),
--   `logo_url` varchar(255)
-- );

-- CREATE TABLE `branches` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `branch_name_en` varchar(100),
--   `branch_name_ur` varchar(100),
--   `address_en` text,
--   `address_ur` text,
--   `phone` varchar(15)
-- );

-- CREATE TABLE `users` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `branch_id` bigint,
--   `name` varchar(100),
--   `username` varchar(50) UNIQUE,
--   `password_hash` varchar(255),
--   `role` enum(admin, manager,cashier,stock_keeper),
--   `phone` varchar(15),
--   `is_active` boolean DEFAULT true
-- );

-- CREATE TABLE `categories` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `name_en` varchar(100),
--   `name_ur` varchar(100)
-- );

-- CREATE TABLE `brands` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `name_en` varchar(100),
--   `name_ur` varchar(100)
-- );

-- CREATE TABLE `products` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `code` varchar(50) UNIQUE,
--   `barcode` varchar(50),
--   `name_en` varchar(200),
--   `name_ur` varchar(200),
--   `brand_id` bigint,
--   `category_id` bigint,
--   `model_compatibility` varchar(255),
--   `purchase_price` decimal(12,4),
--   `selling_price` decimal(12,4),
--   `wholesale_price` decimal(12,4),
--   `gst_percent` decimal(5,2) DEFAULT 17,
--   `stock_qty` decimal(10,2) DEFAULT 0,
--   `min_stock_level` int DEFAULT 5,
--   `images` json,
--   `status` enum(active,inactive),
--   `notes` text
-- );

-- CREATE TABLE `suppliers` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `name` varchar(150),
--   `contact_person` varchar(100),
--   `phone` varchar(20),
--   `cnic` varchar(15),
--   `ntn` varchar(20),
--   `address` text,
--   `notes` text
-- );

-- CREATE TABLE `purchases` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `branch_id` bigint,
--   `supplier_id` bigint,
--   `invoice_no` varchar(100),
--   `purchase_date` date,
--   `subtotal` decimal(14,4),
--   `gst_amount` decimal(14,4),
--   `total_amount` decimal(14,4),
--   `discount_amount` decimal(12,4) DEFAULT 0,
--   `paid_amount` decimal(14,4),
--   `due_amount` decimal(14,4),
--   `payment_method` enum(cash,bank_transfer,jazzcash,easypaisa,cheque,credit),
--   `notes` text,
--   `created_by` bigint
-- );

-- CREATE TABLE `purchase_items` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `purchase_id` bigint,
--   `product_id` bigint,
--   `qty` decimal(10,2),
--   `unit_price` decimal(12,4),
--   `gst_percent` decimal(5,2),
--   `total_price` decimal(14,4)
-- );

-- CREATE TABLE `customers` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `name` varchar(100),
--   `phone` varchar(20) UNIQUE,
--   `cnic` varchar(15),
--   `address` text,
--   `credit_limit` decimal(12,2) DEFAULT 0,
--   `current_credit_balance` decimal(12,2) DEFAULT 0,
--   `loyalty_points` int DEFAULT 0
-- );

-- CREATE TABLE `sales` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `branch_id` bigint,
--   `customer_id` bigint,
--   `invoice_no` varchar(100),
--   `sale_date` datetime,
--   `subtotal` decimal(14,4),
--   `discount_amount` decimal(12,4) DEFAULT 0,
--   `gst_amount` decimal(14,4),
--   `further_tax_amount` decimal(12,4) DEFAULT 0,
--   `total_amount` decimal(14,4),
--   `paid_amount` decimal(14,4),
--   `payment_method` enum(cash,card,jazzcash,easypaisa,bank_transfer,credit,mixed),
--   `payment_details` json,
--   `is_credit_sale` boolean DEFAULT false,
--   `fbr_invoice_number` bigint,
--   `created_by` bigint
-- );

-- CREATE TABLE `sale_items` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `sale_id` bigint,
--   `product_id` bigint,
--   `qty` decimal(10,2),
--   `unit_price` decimal(12,4),
--   `discount_per_item` decimal(10,4) DEFAULT 0,
--   `gst_percent` decimal(5,2),
--   `total_price` decimal(14,4)
-- );

-- CREATE TABLE `credit_payments` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `customer_id` bigint,
--   `amount` decimal(14,4),
--   `payment_date` datetime,
--   `payment_method` enum(cash,jazzcash,easypaisa,bank_transfer),
--   `received_by` bigint
-- );

-- CREATE TABLE `stock_adjustments` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `branch_id` bigint,
--   `product_id` bigint,
--   `qty_change` int,
--   `reason` enum(damage,lost,found,correction,sample,gift),
--   `notes` text,
--   `adjusted_by` bigint,
--   `created_at` timestamp
-- );

-- CREATE TABLE `expense_categories` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `name` varchar(100)
-- );

-- CREATE TABLE `expenses` (
--   `id` bigint PRIMARY KEY AUTO_INCREMENT,
--   `branch_id` bigint,
--   `category_id` bigint,
--   `amount` decimal(10,2),
--   `description` text,
--   `expense_date` date,
--   `paid_to` varchar(150),
--   `created_by` bigint
-- );

-- ALTER TABLE `users` ADD FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`);

-- ALTER TABLE `products` ADD FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`);

-- ALTER TABLE `products` ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

-- ALTER TABLE `purchases` ADD FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`);

-- ALTER TABLE `purchases` ADD FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);

-- ALTER TABLE `purchases` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

-- ALTER TABLE `purchase_items` ADD FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`);

-- ALTER TABLE `purchase_items` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

-- ALTER TABLE `sales` ADD FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`);

-- ALTER TABLE `sales` ADD FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

-- ALTER TABLE `sales` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

-- ALTER TABLE `sale_items` ADD FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`);

-- ALTER TABLE `sale_items` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

-- ALTER TABLE `credit_payments` ADD FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

-- ALTER TABLE `credit_payments` ADD FOREIGN KEY (`received_by`) REFERENCES `users` (`id`);

-- ALTER TABLE `stock_adjustments` ADD FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`);

-- ALTER TABLE `stock_adjustments` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

-- ALTER TABLE `stock_adjustments` ADD FOREIGN KEY (`adjusted_by`) REFERENCES `users` (`id`);

-- ALTER TABLE `expenses` ADD FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`);

-- ALTER TABLE `expenses` ADD FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`);

-- ALTER TABLE `expenses` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);
create database shop_management_system;