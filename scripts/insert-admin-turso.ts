/**
 * Script to create admin user in Turso database
 * This script loads .env.local and inserts admin with hashed password
 * 
 * Usage: npm run create-admin [username] [password] [name]
 * Example: npm run create-admin admin Admin@123 "Administrator"
 */

import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@libsql/client";
import { hash } from "bcryptjs";

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
  console.error("⚠️  Could not load .env.local file");
}

async function insertAdmin() {
  // Get arguments or use defaults
  const args = process.argv.slice(2);
  const username = args[0] || "admin";
  const password = args[1] || "Admin@123";
  const name = args[2] || "Administrator";

  const databaseUrl = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not found in environment variables!");
    console.error("   Make sure .env.local exists with DATABASE_URL set");
    process.exit(1);
  }

  console.log("🔄 Inserting admin user into Turso...");
  console.log(`📡 Database: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);
  console.log(`👤 Username: ${username}`);
  console.log(`📝 Name: ${name}\n`);

  try {
    // Create client
    const client = createClient({
      url: databaseUrl,
      ...(authToken && { authToken }),
    });

    // Check if username already exists
    const existingUser = await client.execute({
      sql: "SELECT id, username, name, role FROM users WHERE username = ?",
      args: [username],
    });

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0] as any;
      console.error(`❌ Username "${username}" already exists!`);
      console.error(`   Existing user: ${user.name} (${user.role})`);
      console.error(`   ID: ${user.id}`);
      console.error("\n💡 To create a different admin user, use:");
      console.error(`   npm run insert-admin-turso <username> <password> <name>`);
      process.exit(1);
    }

    // Hash the password
    console.log("🔐 Hashing password...");
    const passwordHash = await hash(password, 10);

    // Insert admin user
    console.log("📝 Inserting admin user into Turso...");
    await client.execute({
      sql: `INSERT INTO users (
        username,
        password_hash,
        name,
        role,
        branch_id,
        phone,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [username, passwordHash, name, "admin", null, null, 1],
    });

    // Verify the user was created
    const newUser = await client.execute({
      sql: "SELECT id, username, name, role, is_active FROM users WHERE username = ?",
      args: [username],
    });

    if (newUser.rows.length > 0) {
      const user = newUser.rows[0] as any;
      console.log("\n✅ Admin user inserted successfully into Turso!");
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active ? "Yes" : "No"}`);
      console.log("\n📝 Login credentials:");
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
      console.log("\n⚠️  Please change the password after first login!");
    }

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Failed to insert admin user:");

    if (error.message?.includes("no such table: users")) {
      console.error("   Database tables not found!");
      console.error("   Run: npm run db:migrate");
    } else if (error.message?.includes("UNIQUE constraint")) {
      console.error(`   Username "${username}" already exists`);
    } else {
      console.error(`   ${error.message}`);
    }

    process.exit(1);
  }
}

insertAdmin();

