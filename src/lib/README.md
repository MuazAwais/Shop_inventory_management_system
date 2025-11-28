# Shared Utilities Library

Comprehensive utilities for error handling, result types, validation, and API responses.

## Overview

This library provides:

1. **Error Handling** - Custom error classes with proper HTTP status codes
2. **Result Types** - Functional error handling without exceptions
3. **Validation** - Request validation using Yup schemas
4. **API Responses** - Standardized API response helpers

## Quick Start

```typescript
import {
  // Errors
  NotFoundError,
  ValidationError,
  
  // Result types
  success,
  failure,
  resultify,
  
  // Validation
  validateRequestBody,
  productSchemas,
  
  // API responses
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib";
```

## Complete Example

```typescript
import { NextRequest } from "next/server";
import {
  validateRequestBody,
  productSchemas,
  successResponse,
  errorResponse,
  withErrorHandling,
  resultify,
} from "@/lib";
import { ProductService } from "@/services";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Validate request
    const validationResult = await validateRequestBody(
      productSchemas.create,
      request
    );

    if (validationResult.isFailure()) {
      throw validationResult.error;
    }

    // Create product
    const productResult = await resultify(
      ProductService.createProduct(validationResult.value)
    );

    if (productResult.isFailure()) {
      throw productResult.error;
    }

    return productResult.value;
  });
}
```

## Error Handling

### Custom Error Classes

```typescript
import { NotFoundError, BadRequestError } from "@/lib/errors";

throw new NotFoundError("Product");
throw new BadRequestError("Invalid input");
```

### Error Handling in API Routes

```typescript
import { errorResponse, withErrorHandling } from "@/lib/api-response";

// Automatic error handling
export async function GET() {
  return withErrorHandling(async () => {
    // Your code here - errors are automatically caught
    return data;
  });
}

// Manual error handling
export async function POST() {
  try {
    const data = await operation();
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
```

## Result Types

### Basic Usage

```typescript
import { success, failure, Result } from "@/lib/result";

function operation(): Result<number, string> {
  if (condition) {
    return success(42);
  }
  return failure("Operation failed");
}

// Use the result
const result = operation();
if (result.isSuccess()) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

### With Async Operations

```typescript
import { resultify } from "@/lib/result";

const result = await resultify(ProductService.getProduct(1));

if (result.isSuccess()) {
  // Use result.value
} else {
  // Handle result.error
}
```

## Validation

### Request Body Validation

```typescript
import { validateRequestBody } from "@/lib/validation";
import { productSchemas } from "@/lib/validation/schemas";
import { validationErrorResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  const result = await validateRequestBody(
    productSchemas.create,
    request
  );

  if (result.isFailure()) {
    return validationErrorResponse(
      result.error.errors || {},
      result.error.message
    );
  }

  const productData = result.value;
  // Use validated data
}
```

### Query Parameter Validation

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
  }
}
```

## API Responses

### Success Responses

```typescript
import { successResponse } from "@/lib/api-response";

return successResponse(data);
return successResponse(data, "Operation successful", 201);
```

### Error Responses

```typescript
import { errorResponse, notFoundResponse } from "@/lib/api-response";

return errorResponse(error);
return notFoundResponse("Product");
```

### With Result Types

```typescript
import { resultResponse } from "@/lib/api-response";
import { resultify } from "@/lib/result";

const result = await resultify(operation());
return resultResponse(result);
```

## Best Practices

1. **Use Result types** for operations that might fail
2. **Validate early** - validate requests at the API route level
3. **Use custom errors** for domain-specific errors
4. **Standardize responses** - use API response helpers
5. **Handle errors consistently** - use `withErrorHandling` wrapper

## File Structure

```
src/lib/
├── errors/          # Custom error classes
├── result/          # Result type pattern
├── validation/      # Request validation
│   └── schemas.ts   # Validation schemas
├── api-response/    # API response helpers
├── auth/            # Authentication utilities
├── utils.ts         # General utilities
└── index.ts         # Main exports
```

