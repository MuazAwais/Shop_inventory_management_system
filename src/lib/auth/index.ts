/**
 * Authentication utilities and configuration
 * Using Lucia Auth with Drizzle adapter
 */

import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@/db";
import { users } from "@/db/schema";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

// Initialize Lucia
const adapter = new DrizzleSQLiteAdapter(db, {
  user: users,
  session: null, // We'll create a sessions table if needed
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      username: attributes.username,
      role: attributes.role,
      branchId: attributes.branchId,
      isActive: attributes.isActive,
    };
  },
});

// Declare module augmentation for Lucia
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      id: number;
      username: string;
      role: string;
      branchId: number | null;
      isActive: boolean;
    };
  }
}

/**
 * Get the current session and user
 */
export async function getSession() {
  // Check for auth_session cookie (our custom implementation)
  const authCookie = cookies().get("auth_session")?.value;
  
  if (authCookie) {
    try {
      const sessionData = JSON.parse(authCookie);
      // Fetch user from database
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, sessionData.userId))
        .limit(1);

      if (user.length > 0 && user[0].isActive) {
        return {
          user: {
            id: user[0].id,
            username: user[0].username,
            role: user[0].role,
            branchId: user[0].branchId,
            isActive: user[0].isActive,
          },
          session: { id: "auth_session", userId: sessionData.userId },
        };
      }
    } catch (error) {
      // Invalid cookie format, fall through
    }
  }

  // Fallback to Lucia session (if implemented)
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (sessionId) {
    try {
      const result = await lucia.validateSession(sessionId);
      return result;
    } catch (error) {
      // Invalid session
    }
  }

  return { user: null, session: null };
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const { user, session } = await getSession();
  
  if (!user || !session) {
    throw new Error("Unauthorized");
  }

  return { user, session };
}

/**
 * Check if user has required role
 */
export function hasRole(user: { role: string }, requiredRole: string | string[]) {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(user.role);
}

/**
 * Require specific role - throws if user doesn't have role
 */
export async function requireRole(requiredRole: string | string[]) {
  const { user } = await requireAuth();
  
  if (!hasRole(user, requiredRole)) {
    throw new Error("Forbidden: Insufficient permissions");
  }

  return { user };
}

