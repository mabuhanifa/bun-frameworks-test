/**
 * Error types and utilities for Posts CRUD API
 * This file defines custom error classes and error handling utilities
 */

import type { ErrorResponse, ValidationError } from "./posts.types";

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON(): ErrorResponse {
    return {
      error: {
        message: this.message,
        code: this.code,
        details: this.details,
      },
    };
  }
}

export class ValidationApiError extends ApiError {
  constructor(errors: ValidationError[]) {
    const details: Record<string, string[]> = {};

    errors.forEach((error) => {
      if (!details[error.field]) {
        details[error.field] = [];
      }
      details[error.field].push(error.message);
    });

    super(
      "Validation failed",
      400, // HttpStatusCode.BAD_REQUEST
      "VALIDATION_ERROR", // ErrorCode.VALIDATION_ERROR
      details
    );
    this.name = "ValidationApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with ID ${identifier} not found`
      : `${resource} not found`;

    super(
      message,
      404, // HttpStatusCode.NOT_FOUND
      "NOT_FOUND" // ErrorCode.NOT_FOUND
    );
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: Record<string, string[]>) {
    super(
      message,
      409, // HttpStatusCode.CONFLICT
      "CONFLICT", // Custom conflict code
      details
    );
    this.name = "ConflictError";
  }
}

export class DuplicateSlugError extends ConflictError {
  constructor(slug: string) {
    super(`Post with slug '${slug}' already exists`, {
      slug: [`Slug '${slug}' is already in use`],
    });
    this.name = "DuplicateSlugError";
    this.code = "DUPLICATE_SLUG"; // ErrorCode.DUPLICATE_SLUG
  }
}

export class ForeignKeyConstraintError extends ApiError {
  constructor(field: string, value: string | number) {
    super(
      `Referenced ${field} with value ${value} does not exist`,
      400, // HttpStatusCode.BAD_REQUEST
      "FOREIGN_KEY_CONSTRAINT", // ErrorCode.FOREIGN_KEY_CONSTRAINT
      { [field]: [`Referenced ${field} does not exist`] }
    );
    this.name = "ForeignKeyConstraintError";
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, originalError?: Error) {
    super(
      message,
      500, // HttpStatusCode.INTERNAL_SERVER_ERROR
      "DATABASE_ERROR" // ErrorCode.DATABASE_ERROR
    );
    this.name = "DatabaseError";

    // Preserve original error stack if available
    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    }
  }
}

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

export class ErrorFactory {
  static validation(errors: ValidationError[]): ValidationApiError {
    return new ValidationApiError(errors);
  }

  static notFound(
    resource: string,
    identifier?: string | number
  ): NotFoundError {
    return new NotFoundError(resource, identifier);
  }

  static duplicateSlug(slug: string): DuplicateSlugError {
    return new DuplicateSlugError(slug);
  }

  static foreignKeyConstraint(
    field: string,
    value: string | number
  ): ForeignKeyConstraintError {
    return new ForeignKeyConstraintError(field, value);
  }

  static database(message: string, originalError?: Error): DatabaseError {
    return new DatabaseError(message, originalError);
  }

  static conflict(
    message: string,
    details?: Record<string, string[]>
  ): ConflictError {
    return new ConflictError(message, details);
  }

  static internal(message: string = "Internal server error"): ApiError {
    return new ApiError(
      message,
      500, // HttpStatusCode.INTERNAL_SERVER_ERROR
      "INTERNAL_ERROR" // ErrorCode.INTERNAL_ERROR
    );
  }
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

export class ErrorUtils {
  /**
   * Checks if an error is an instance of ApiError
   */
  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  /**
   * Converts any error to an ApiError
   */
  static toApiError(error: unknown): ApiError {
    if (ErrorUtils.isApiError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return ErrorFactory.internal(error.message);
    }

    return ErrorFactory.internal("An unknown error occurred");
  }

  /**
   * Formats an error for HTTP response
   */
  static formatErrorResponse(error: ApiError): ErrorResponse {
    return error.toJSON();
  }

  /**
   * Logs error with appropriate level based on status code
   */
  static logError(error: ApiError, context?: Record<string, any>): void {
    const logData = {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
      context,
    };

    if (error.statusCode >= 500) {
      console.error("Server Error:", logData);
    } else if (error.statusCode >= 400) {
      console.warn("Client Error:", logData);
    } else {
      console.info("API Error:", logData);
    }
  }

  /**
   * Determines if an error should be retried
   */
  static isRetryableError(error: ApiError): boolean {
    // Only retry server errors, not client errors
    return error.statusCode >= 500;
  }

  /**
   * Extracts validation errors from an ApiError
   */
  static getValidationErrors(error: ApiError): ValidationError[] {
    if (error.code !== "VALIDATION_ERROR" || !error.details) {
      return [];
    }

    const validationErrors: ValidationError[] = [];

    Object.entries(error.details).forEach(([field, messages]) => {
      messages.forEach((message) => {
        validationErrors.push({
          field,
          message,
          code: "VALIDATION_ERROR",
        });
      });
    });

    return validationErrors;
  }
}

// ============================================================================
// ERROR RESPONSE BUILDERS
// ============================================================================

export class ErrorResponseBuilder {
  static success<T>(data: T, statusCode: number = 200): Response {
    return new Response(JSON.stringify(data), {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  static error(error: ApiError): Response {
    const errorResponse = ErrorUtils.formatErrorResponse(error);

    return new Response(JSON.stringify(errorResponse), {
      status: error.statusCode,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  static validation(errors: ValidationError[]): Response {
    const error = ErrorFactory.validation(errors);
    return ErrorResponseBuilder.error(error);
  }

  static notFound(resource: string, identifier?: string | number): Response {
    const error = ErrorFactory.notFound(resource, identifier);
    return ErrorResponseBuilder.error(error);
  }

  static internal(message?: string): Response {
    const error = ErrorFactory.internal(message);
    return ErrorResponseBuilder.error(error);
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidationError(
  error: ApiError
): error is ValidationApiError {
  return error instanceof ValidationApiError;
}

export function isNotFoundError(error: ApiError): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isDuplicateSlugError(
  error: ApiError
): error is DuplicateSlugError {
  return error instanceof DuplicateSlugError;
}

export function isForeignKeyConstraintError(
  error: ApiError
): error is ForeignKeyConstraintError {
  return error instanceof ForeignKeyConstraintError;
}

export function isDatabaseError(error: ApiError): error is DatabaseError {
  return error instanceof DatabaseError;
}
