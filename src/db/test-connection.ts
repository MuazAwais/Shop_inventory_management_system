/**
 * Database Connection Test Script
 * Run with: npm run db:test
 * Or manually: npx tsx src/db/test-connection.ts
 */

import { db } from "./index";
import { sql } from "drizzle-orm";

async function testConnection() {
  try {
    console.log("🔌 Testing database connection...");
    const dbUrl = process.env.DATABASE_URL || "file:./local.db";
    console.log(`📁 Database URL: ${dbUrl}`);
    
    // Test basic connection
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connection successful!");
    console.log("📊 Test query result:", result);
    
    // Check if tables exist
    const tables = await db.execute(
      sql`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`
    );
    console.log("\n📋 Existing tables:");
    if (Array.isArray(tables) && tables.length > 0) {
      tables.forEach((table: any) => {
        console.log(`  - ${table.name}`);
      });
    } else {
      console.log("  (No tables found)");
    }
    
    console.log("\n✨ Database is ready for use!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
