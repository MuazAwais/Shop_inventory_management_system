import { db } from "@/db";
import { sql } from "drizzle-orm";
import { successResponse, errorResponse, withErrorHandling } from "@/lib/api-response";

export async function GET() {
  return withErrorHandling(async () => {
    // Test basic connection
    const result = await db.execute(sql`SELECT 1 as test`);
    
    // Get list of tables
    const tables = await db.execute(
      sql`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`
    );
    
    const dbUrl = process.env.DATABASE_URL || "file:./local.db";
    
    return {
      message: "Database connection successful",
      databaseUrl: dbUrl,
      testQuery: result,
      tables: tables,
    };
  });
}

