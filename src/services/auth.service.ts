import { hash, compare } from "bcryptjs";
import { getUserByUsername, getUserById } from "@/db/queries/users";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Authentication service
 * Handles user authentication, password hashing, and session management
 */

export class AuthService {
  /**
   * Hash a password
   */
  static async hashPassword(password: string): Promise<string> {
    return await hash(password, 10);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return await compare(password, hash);
  }

  /**
   * Authenticate a user by username and password
   */
  static async authenticate(
    username: string,
    password: string
  ): Promise<{ success: boolean; user?: any; error?: string }> {
    const user = await getUserByUsername(username);

    if (!user) {
      return { success: false, error: "Invalid credentials" };
    }

    if (!user.isActive) {
      return { success: false, error: "Account is inactive" };
    }

    if (!user.passwordHash) {
      return { success: false, error: "Invalid credentials" };
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return { success: false, error: "Invalid credentials" };
    }

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return { success: true, user: userWithoutPassword };
  }

  /**
   * Create a new user
   */
  static async createUser(data: {
    username: string;
    password: string;
    name: string;
    role: string;
    branchId?: number | null;
    phone?: string;
  }) {
    const existingUser = await getUserByUsername(data.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const passwordHash = await this.hashPassword(data.password);

    const [newUser] = await db
      .insert(users)
      .values({
        username: data.username,
        passwordHash,
        name: data.name,
        role: data.role,
        branchId: data.branchId || null,
        phone: data.phone || null,
        isActive: true,
      })
      .returning();

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: number, newPassword: string) {
    const passwordHash = await this.hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId));

    return { success: true };
  }
}

