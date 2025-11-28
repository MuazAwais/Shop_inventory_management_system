/**
 * Script to create an admin user
 * Run with: npx tsx src/scripts/create-admin.ts
 * Or: npm run create-admin (if script is added to package.json)
 */

import { AuthService } from "../services";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

async function createAdmin() {
  const args = process.argv.slice(2);
  const username = args[0] || "admin";
  const password = args[1] || "admin123";
  const name = args[2] || "Administrator";

  try {
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("⚠️  Admin user already exists!");
      console.log(`   Username: ${existingAdmin[0].username}`);
      console.log("   To create another admin, use the register page or modify this script.");
      process.exit(0);
    }

    // Create admin user
    const admin = await AuthService.createUser({
      username,
      password,
      name,
      role: "admin",
      branchId: null,
      phone: null,
    });

    console.log("✅ Admin user created successfully!");
    console.log(`   Username: ${admin.username}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log("\n📝 Default credentials:");
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log("\n⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Failed to create admin user:");
    console.error(error.message);
    process.exit(1);
  }
}

createAdmin();

