import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Initialize the database client
// Defaults to local.db for local development if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || "file:./local.db";

const client = createClient({
  url: databaseUrl,
  // For Turso/libSQL cloud, add auth token if provided
  ...(process.env.TURSO_AUTH_TOKEN && {
    authToken: process.env.TURSO_AUTH_TOKEN,
  }),
});

// Create the Drizzle database instance
export const db = drizzle(client, { schema });

// Export schema for use in other files
export * from "./schema";

