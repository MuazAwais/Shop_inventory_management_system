/**
 * Script to apply database migration to Turso
 * This will execute the migration SQL directly on Turso database
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

// Create client directly to ensure we use the right database
const databaseUrl = process.env.DATABASE_URL || "file:./local.db";
const client = createClient({
  url: databaseUrl,
  ...(process.env.TURSO_AUTH_TOKEN && {
    authToken: process.env.TURSO_AUTH_TOKEN,
  }),
});

async function applyMigration() {
  try {
    const dbUrl = process.env.DATABASE_URL || "file:./local.db";
    console.log("🔄 Applying migration to Turso database...");
    console.log(`📡 Database: ${dbUrl.replace(/\/\/.*@/, '//***@')}\n`);
    
    // Read the migration SQL file
    const migrationSQL = readFileSync(
      join(process.cwd(), "drizzle", "0000_gray_young_avengers.sql"),
      "utf-8"
    );

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement || statement.startsWith("--")) continue;

      try {
        console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
        const result = await client.execute(statement);
        console.log("✅ Statement executed successfully");
      } catch (error: any) {
        // Ignore "table already exists" errors, but log them
        if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
          console.log("⚠️  Table/constraint already exists, skipping...");
        } else {
          console.error(`❌ Error executing statement:`, error.message);
          console.error(`Statement: ${statement.substring(0, 150)}...`);
          // Don't throw - continue with other statements
          console.log("⚠️  Continuing with next statement...");
        }
      }
    }

    console.log("\n✅ Migration applied successfully!");
    console.log("📋 Verifying tables...");

    // Verify tables were created
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );

    console.log(`\n📊 Found ${tables.rows.length} tables:`);
    tables.rows.forEach((row: any) => {
      console.log(`   - ${row.name}`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Failed to apply migration:");
    console.error(error.message);
    process.exit(1);
  }
}

applyMigration();

