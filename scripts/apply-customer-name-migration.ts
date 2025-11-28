/**
 * Script to apply customer_name column migration to database
 */

import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@libsql/client";

// Load environment variables from .env.local manually
try {
  const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  });
} catch (error) {
  // .env.local might not exist, that's okay
}

const databaseUrl = process.env.DATABASE_URL || "file:./local.db";
const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function applyMigration() {
  try {
    console.log("🔄 Applying customer_name column migration...");
    console.log(`📡 Database: ${databaseUrl.replace(/\/\/.*@/, '//***@')}\n`);
    
    // Check if column already exists
    const tableInfo = await client.execute(
      "PRAGMA table_info(sales)"
    );
    
    const hasColumn = tableInfo.rows.some(
      (row: any) => row.name === "customer_name"
    );
    
    if (hasColumn) {
      console.log("✅ Column 'customer_name' already exists in sales table");
      return;
    }
    
    // Apply the migration
    const migrationSQL = "ALTER TABLE `sales` ADD COLUMN `customer_name` text(200);";
    
    console.log("📝 Executing migration SQL...");
    await client.execute(migrationSQL);
    
    console.log("✅ Migration applied successfully!");
    
    // Verify the column was added
    const newTableInfo = await client.execute(
      "PRAGMA table_info(sales)"
    );
    
    const columnExists = newTableInfo.rows.some(
      (row: any) => row.name === "customer_name"
    );
    
    if (columnExists) {
      console.log("✅ Verified: customer_name column exists in sales table");
    } else {
      console.error("❌ Warning: Column was not found after migration");
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error applying migration:", error.message);
    process.exit(1);
  }
}

applyMigration();

