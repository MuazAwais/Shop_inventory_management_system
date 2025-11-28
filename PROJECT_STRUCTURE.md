# Project Structure

This document describes the consistent module structure for the Shop Management System.

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes group
│   │   ├── layout.tsx     # Auth layout (centered, minimal)
│   │   └── login/         # Login page
│   ├── (dashboard)/       # Protected dashboard routes group
│   │   ├── layout.tsx    # Dashboard layout (with nav)
│   │   └── dashboard/     # Dashboard page
│   ├── api/               # API routes
│   │   └── db/            # Database API endpoints
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
│
├── db/                    # Database layer
│   ├── schema/            # Drizzle schema definitions
│   │   ├── index.ts       # Schema exports
│   │   └── shop.ts        # Shop management schemas
│   ├── queries/           # Database query functions
│   │   ├── index.ts       # Query exports
│   │   ├── users.ts       # User queries
│   │   ├── products.ts    # Product queries
│   │   ├── sales.ts       # Sales queries
│   │   └── purchases.ts   # Purchase queries
│   ├── index.ts           # Database connection & exports
│   └── test-connection.ts # Connection test utility
│
├── services/              # Business logic layer
│   ├── index.ts           # Service exports
│   ├── auth.service.ts    # Authentication service
│   ├── product.service.ts # Product business logic
│   ├── sale.service.ts    # Sales business logic
│   └── purchase.service.ts # Purchase business logic
│
├── lib/                   # Shared libraries & utilities
│   ├── auth/              # Authentication utilities
│   │   └── index.ts       # Auth config & helpers
│   └── utils.ts           # General utilities
│
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared types
│
└── middleware.ts          # Next.js middleware (route protection)
```

## Module Responsibilities

### `src/app/` - Application Routes

**Route Groups:**
- `(auth)/` - Authentication pages (login, register)
  - Uses centered layout
  - Public routes (no auth required)
  
- `(dashboard)/` - Protected dashboard routes
  - Uses dashboard layout with navigation
  - Requires authentication
  - Role-based access control

**Layouts:**
- `layout.tsx` - Root layout (fonts, global styles)
- `(auth)/layout.tsx` - Auth-specific layout
- `(dashboard)/layout.tsx` - Dashboard layout with nav

**API Routes:**
- `api/` - Next.js API routes
  - RESTful endpoints
  - Use services layer for business logic

### `src/db/` - Database Layer

**Schema (`db/schema/`):**
- Drizzle ORM table definitions
- Type-safe database schema
- Exported from `schema/index.ts`

**Queries (`db/queries/`):**
- Pure database operations
- No business logic
- Use Drizzle ORM query builder
- Organized by domain (users, products, sales, etc.)

**Connection:**
- `db/index.ts` - Database client initialization
- Exports `db` instance and schema

### `src/services/` - Business Logic Layer

**Services:**
- Contain business logic and validation
- Use queries from `db/queries/`
- Handle complex operations (e.g., creating sales with stock updates)
- Stateless service classes with static methods

**Service Pattern:**
```typescript
export class ServiceName {
  static async methodName() {
    // Business logic here
    // Use queries from db/queries
  }
}
```

### `src/lib/` - Shared Libraries

**Auth (`lib/auth/`):**
- Lucia auth configuration
- Session management
- Auth helpers (`requireAuth`, `requireRole`)

**Utils (`lib/utils.ts`):**
- General utility functions
- Formatting helpers (currency, dates)
- Tailwind class merging

### `src/types/` - Type Definitions

- Shared TypeScript types
- API response types
- Domain types (UserRole, PaymentMethod, etc.)

### `src/middleware.ts` - Route Protection

- Next.js middleware
- Protects routes based on authentication
- Redirects unauthenticated users to login
- Redirects authenticated users away from auth pages

## Usage Patterns

### Protected Route Example

```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const { user } = await requireAuth();
  // Page content
}
```

### Using Services

```typescript
// In API route or server component
import { ProductService } from "@/services";

const product = await ProductService.getProduct(1);
```

### Using Queries

```typescript
// Direct database queries (no business logic)
import { getUserById } from "@/db/queries";

const user = await getUserById(1);
```

### Using Auth Helpers

```typescript
import { requireAuth, requireRole } from "@/lib/auth";

// Require any authenticated user
const { user } = await requireAuth();

// Require specific role
const { user } = await requireRole("admin");
```

## Best Practices

1. **Separation of Concerns:**
   - Queries: Pure database operations
   - Services: Business logic
   - Routes: Request/response handling

2. **Type Safety:**
   - Use TypeScript types from `src/types/`
   - Leverage Drizzle's inferred types

3. **Error Handling:**
   - Services throw errors for invalid operations
   - API routes catch and format errors

4. **Authentication:**
   - Use `requireAuth()` in server components
   - Use middleware for route protection
   - Check roles with `requireRole()`

5. **Code Organization:**
   - Group related functionality
   - Export from index files
   - Use consistent naming

## Adding New Features

1. **New Table:**
   - Add schema to `db/schema/`
   - Export from `schema/index.ts`

2. **New Queries:**
   - Create file in `db/queries/`
   - Export from `queries/index.ts`

3. **New Service:**
   - Create file in `services/`
   - Export from `services/index.ts`

4. **New Route:**
   - Add to appropriate route group
   - Use services for business logic
   - Protect with `requireAuth()` if needed

