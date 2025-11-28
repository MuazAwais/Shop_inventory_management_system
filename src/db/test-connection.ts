/**
 * Database Connection Test Script
 * Run with: npm run db:test
 * Or manually: npx tsx src/db/test-connection.ts
 */

import { client } from "./index";

async function testConnection() {
  try {
    console.log("🔌 Testing database connection...");
    const dbUrl = process.env.DATABASE_URL || "file:./local.db";
    console.log(`📁 Database URL: ${dbUrl}`);
    
    // Test basic connection
    const result = await client.execute("SELECT 1 as test");
    console.log("✅ Database connection successful!");
    console.log("📊 Test query result:", result);
    
    // Check if tables exist
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    console.log("\n📋 Existing tables:");
    if (tables.rows && tables.rows.length > 0) {
      tables.rows.forEach((row: any) => {
        console.log(`  - ${row.name}`);
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
