# Result Type Pattern

The Result type provides functional error handling without throwing exceptions.

## Usage

### Basic Usage

```typescript
import { success, failure, Result } from "@/lib/result";

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return failure("Cannot divide by zero");
  }
  return success(a / b);
}

// Use the result
const result = divide(10, 2);
if (result.isSuccess()) {
  console.log(result.value); // 5
} else {
  console.error(result.error); // Error message
}
```

### With Async Operations

```typescript
import { resultify } from "@/lib/result";

const result = await resultify(fetchData());

if (result.isSuccess()) {
  // Use result.value
} else {
  // Handle result.error
}
```

### Unwrapping Results

```typescript
// Get value or throw
const value = result.unwrap();

// Get value or default
const value = result.unwrapOr(0);

// Get value or compute from error
const value = result.unwrapOrElse((error) => {
  console.error(error);
  return defaultValue;
});
```

### Mapping Results

```typescript
// Transform success value
const doubled = result.map((value) => value * 2);

// Transform error
const mappedError = result.mapError((error) => error.message);
```

