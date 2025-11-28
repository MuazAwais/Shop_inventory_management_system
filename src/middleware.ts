import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for protected routes
 * Handles authentication and authorization
 */

// Define protected routes
const protectedRoutes = ["/dashboard", "/admin", "/users", "/shop-profile", "/branches"];
const authRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Only protect dashboard routes - allow access to login always
  if (isProtectedRoute) {
    const token = request.cookies.get("auth_session")?.value;
    
    // Redirect to login if accessing protected route without auth
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow access to login route without redirect
  // Users can access login even if they have a session (to switch accounts)
  // Register route redirects to login (public registration disabled)
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

