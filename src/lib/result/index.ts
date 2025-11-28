/**
 * Result type pattern for functional error handling
 * Inspired by Rust's Result<T, E> type
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly success = true as const;

  constructor(public readonly value: T) {}

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<never> {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return success(fn(this.value));
  }

  mapError<F>(): Result<T, F> {
    return this as unknown as Result<T, F>;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr<U>(_defaultValue: U): T {
    return this.value;
  }

  unwrapOrElse<U>(_fn: () => U): T {
    return this.value;
  }
}

export class Failure<E> {
  readonly success = false as const;

  constructor(public readonly error: E) {}

  isSuccess(): this is Success<never> {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }

  map<U>(): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  mapError<F>(fn: (error: E) => F): Result<never, F> {
    return failure(fn(this.error));
  }

  unwrap(): never {
    throw this.error;
  }

  unwrapOr<U>(defaultValue: U): U {
    return defaultValue;
  }

  unwrapOrElse<U>(fn: (error: E) => U): U {
    return fn(this.error);
  }
}

/**
 * Create a success result
 */
export function success<T>(value: T): Success<T> {
  return new Success(value);
}

/**
 * Create a failure result
 */
export function failure<E>(error: E): Failure<E> {
  return new Failure(error);
}

/**
 * Wrap a promise that might throw into a Result
 */
export async function resultify<T>(
  promise: Promise<T>
): Promise<Result<T, Error>> {
  try {
    const value = await promise;
    return success(value);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Wrap a function that might throw into a Result
 */
export function tryCatch<T, E = Error>(
  fn: () => T
): Result<T, E> {
  try {
    return success(fn());
  } catch (error) {
    return failure(error as E);
  }
}

/**
 * Wrap an async function that might throw into a Result
 */
export async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T>
): Promise<Result<T, E>> {
  try {
    const value = await fn();
    return success(value);
  } catch (error) {
    return failure(error as E);
  }
}

/**
 * Combine multiple results into one
 * Returns first failure, or success with array of values
 */
export function combine<T, E>(
  results: Result<T, E>[]
): Result<T[], E> {
  const values: T[] = [];

  for (const result of results) {
    if (result.isFailure()) {
      return result.map(() => [] as T[]);
    }
    values.push(result.value);
  }

  return success(values);
}

/**
 * Execute async operations in sequence, stopping on first error
 */
export async function sequence<T, E>(
  operations: (() => Promise<Result<T, E>>)[]
): Promise<Result<T[], E>> {
  const results: T[] = [];

  for (const operation of operations) {
    const result = await operation();
    if (result.isFailure()) {
      return result.map(() => [] as T[]);
    }
    results.push(result.value);
  }

  return success(results);
}

