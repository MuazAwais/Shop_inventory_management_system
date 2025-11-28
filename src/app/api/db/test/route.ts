import { client } from "@/db";
import { successResponse, withErrorHandling } from "@/lib/api-response";

export async function GET() {
  return withErrorHandling(async () => {
    // Test basic connection using client directly
    const result = await client.execute("SELECT 1 as test");
    
    // Get list of tables
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    
    const dbUrl = process.env.DATABASE_URL || "file:./local.db";
    
    return {
      message: "Database connection successful",
      databaseUrl: dbUrl,
      testQuery: result,
      tables: tables.rows,
    };
  });
}

