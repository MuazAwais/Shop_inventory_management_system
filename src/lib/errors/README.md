# Error Handling Utilities

This module provides custom error classes and error handling utilities for consistent error management across the application.

## Usage

### Custom Error Classes

```typescript
import { 
  BadRequestError, 
  NotFoundError, 
  ValidationError 
} from "@/lib/errors";

// Throw specific errors
throw new NotFoundError("Product");
throw new BadRequestError("Invalid input");
throw new ValidationError("Validation failed", { field: ["Error message"] });
```

### Error Handling in API Routes

```typescript
import { errorResponse, successResponse } from "@/lib/api-response";
import { toAppError } from "@/lib/errors";

export async function GET() {
  try {
    const data = await someOperation();
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
```

### Available Error Classes

- `AppError` - Base error class
- `BadRequestError` (400) - Invalid request
- `UnauthorizedError` (401) - Authentication required
- `ForbiddenError` (403) - Insufficient permissions
- `NotFoundError` (404) - Resource not found
- `ConflictError` (409) - Resource conflict
- `ValidationError` (422) - Validation failed
- `InternalServerError` (500) - Server error
- `DatabaseError` (500) - Database operation failed

