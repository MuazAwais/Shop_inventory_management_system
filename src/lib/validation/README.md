# Validation Utilities

Request validation using Yup schemas with Result type pattern.

## Usage

### Basic Validation

```typescript
import { validate, validateOrThrow } from "@/lib/validation";
import { productSchemas } from "@/lib/validation/schemas";

// Using Result type (functional)
const result = await validate(productSchemas.create, requestBody);
if (result.isSuccess()) {
  const product = result.value;
  // Use validated data
} else {
  // Handle validation errors
  const errors = result.error.errors;
}

// Using throw (imperative)
try {
  const product = await validateOrThrow(productSchemas.create, requestBody);
  // Use validated data
} catch (error) {
  // Handle validation error
}
```

### In API Routes

```typescript
import { validateRequestBody } from "@/lib/validation";
import { validationErrorResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  const result = await validateRequestBody(productSchemas.create, request);
  
  if (result.isFailure()) {
    return validationErrorResponse(
      result.error.errors || {},
      result.error.message
    );
  }
  
  const productData = result.value;
  // Process validated data
}
```

### Query Parameters

```typescript
import { validateQueryParams } from "@/lib/validation";
import { commonSchemas } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await validateQueryParams(
    commonSchemas.pagination,
    searchParams
  );
  
  if (result.isSuccess()) {
    const { page, limit } = result.value;
    // Use validated params
  }
}
```

### Available Schemas

- `userSchemas` - User authentication and management
- `productSchemas` - Product CRUD operations
- `saleSchemas` - Sales transactions
- `purchaseSchemas` - Purchase transactions
- `customerSchemas` - Customer management
- `commonSchemas` - Common patterns (pagination, search, etc.)

