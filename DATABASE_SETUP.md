# Database Setup Guide

## Local Development Setup

The project is configured to use SQLite for local development with Drizzle ORM.

### 1. Environment Configuration

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="file:./local.db"
```

**Note:** The `.env.local` file is gitignored for security. Use `.env.example` as a template.

### 2. Database Initialization

The database file (`local.db`) will be created automatically when you run migrations or start the application.

#### Generate Migrations
```bash
npm run db:generate
```

#### Apply Migrations to Database
```bash
npm run db:push
```

### 3. Verify Database Connection

#### Option 1: Using Next.js API Route
Start the development server and visit:
```
http://localhost:3000/api/db/test
```

This will return a JSON response showing:
- Connection status
- Database URL
- List of tables

#### Option 2: Using Drizzle Studio
```bash
npm run db:studio
```

This opens a visual database browser at `http://localhost:4983`

### 4. Database Configuration Files

- **`drizzle.config.ts`** - Drizzle Kit configuration for migrations
- **`src/db/index.ts`** - Database connection and Drizzle instance
- **`src/db/schema/`** - Database schema definitions

### 5. Using Turso (Cloud SQLite)

If you want to use Turso/libSQL cloud instance instead of local SQLite:

1. Create a Turso account and database at [turso.tech](https://turso.tech)

2. Update `.env.local`:
```env
DATABASE_URL="libsql://your-database-url"
TURSO_AUTH_TOKEN="your-auth-token"
```

3. Update `src/db/index.ts` to include auth token:
```typescript
const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

### 6. Available Scripts

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema changes directly to database (dev only)
- `npm run db:studio` - Open Drizzle Studio for visual database management
- `npm run db:test` - Test database connection (requires tsx)

### 7. Current Database Schema

The database includes 16 tables:
- `shop_profile` - Shop information
- `branches` - Branch locations
- `users` - User accounts
- `categories` - Product categories
- `brands` - Product brands
- `products` - Product catalog
- `suppliers` - Supplier information
- `purchases` - Purchase orders
- `purchase_items` - Purchase line items
- `customers` - Customer information
- `sales` - Sales transactions
- `sale_items` - Sale line items
- `credit_payments` - Credit payment records
- `stock_adjustments` - Stock adjustment records
- `expense_categories` - Expense categories
- `expenses` - Expense records

### 8. Troubleshooting

**Issue: "Please specify 'dialect' param in config file"**
- ✅ Fixed: The `drizzle.config.ts` now includes `dialect: "sqlite"`

**Issue: Database file not found**
- The database file will be created automatically on first connection
- Ensure `DATABASE_URL` points to the correct path

**Issue: Connection timeout (Turso)**
- Verify your `TURSO_AUTH_TOKEN` is correct
- Check your network connection
- Ensure the database URL is correct

### 9. Development Workflow

1. Make changes to schema files in `src/db/schema/`
2. Generate migration: `npm run db:generate`
3. Review generated SQL in `drizzle/` folder
4. Apply migration: `npm run db:push`
5. Test connection: Visit `/api/db/test`

