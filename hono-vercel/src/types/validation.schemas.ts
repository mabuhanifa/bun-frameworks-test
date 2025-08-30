/**
 * Validation schemas for Posts CRUD API
 * This file defines validation schemas and validation logic for request DTOs
 */

import type {
  CreatePostRequest,
  ListPostsQuery,
  UpdatePostRequest,
  ValidationError,
  ValidationResult,
  ValidationSchema,
} from "./posts.types";

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export class ValidationUtils {
  static isString(value: unknown): value is string {
    return typeof value === "string";
  }

  static isNumber(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value);
  }

  static isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static sanitizeString(value: string): string {
    return value.trim();
  }

  static parseIntegerArray(value: string): number[] {
    return value
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));
  }
}

// ============================================================================
// BASE VALIDATION CLASS
// ============================================================================

export abstract class BaseValidator<T> implements ValidationSchema<T> {
  protected errors: ValidationError[] = [];

  protected addError(field: string, message: string, code: string): void {
    this.errors.push({ field, message, code });
  }

  protected clearErrors(): void {
    this.errors = [];
  }

  abstract validateData(data: unknown): T | null;

  validate(data: unknown): ValidationResult<T> {
    this.clearErrors();
    const validatedData = this.validateData(data);

    if (this.errors.length > 0) {
      return {
        success: false,
        errors: this.errors,
      };
    }

    return {
      success: true,
      data: validatedData!,
    };
  }
}

// ============================================================================
// CREATE POST VALIDATION SCHEMA
// ============================================================================

export class CreatePostValidator extends BaseValidator<CreatePostRequest> {
  validateData(data: unknown): CreatePostRequest | null {
    if (!data || typeof data !== "object") {
      this.addError("root", "Request body must be an object", "INVALID_TYPE");
      return null;
    }

    const input = data as Record<string, unknown>;
    const result: Partial<CreatePostRequest> = {};

    // Validate title (required)
    if (!input.title) {
      this.addError("title", "Title is required", "REQUIRED");
    } else if (!ValidationUtils.isString(input.title)) {
      this.addError("title", "Title must be a string", "INVALID_TYPE");
    } else if (input.title.trim().length === 0) {
      this.addError("title", "Title cannot be empty", "EMPTY_VALUE");
    } else if (input.title.length > 255) {
      this.addError(
        "title",
        "Title cannot exceed 255 characters",
        "MAX_LENGTH"
      );
    } else {
      result.title = ValidationUtils.sanitizeString(input.title);
    }

    // Validate content (required)
    if (!input.content) {
      this.addError("content", "Content is required", "REQUIRED");
    } else if (!ValidationUtils.isString(input.content)) {
      this.addError("content", "Content must be a string", "INVALID_TYPE");
    } else if (input.content.trim().length === 0) {
      this.addError("content", "Content cannot be empty", "EMPTY_VALUE");
    } else {
      result.content = ValidationUtils.sanitizeString(input.content);
    }

    // Validate categoryId (required)
    if (!input.categoryId) {
      this.addError("categoryId", "Category ID is required", "REQUIRED");
    } else if (!ValidationUtils.isNumber(input.categoryId)) {
      this.addError(
        "categoryId",
        "Category ID must be a number",
        "INVALID_TYPE"
      );
    } else if (input.categoryId <= 0) {
      this.addError(
        "categoryId",
        "Category ID must be a positive number",
        "INVALID_VALUE"
      );
    } else {
      result.categoryId = input.categoryId;
    }

    // Validate description (optional)
    if (input.description !== undefined) {
      if (!ValidationUtils.isString(input.description)) {
        this.addError(
          "description",
          "Description must be a string",
          "INVALID_TYPE"
        );
      } else if (input.description.length > 500) {
        this.addError(
          "description",
          "Description cannot exceed 500 characters",
          "MAX_LENGTH"
        );
      } else {
        result.description = ValidationUtils.sanitizeString(input.description);
      }
    }

    // Validate coverImageUrl (optional)
    if (input.coverImageUrl !== undefined) {
      if (!ValidationUtils.isString(input.coverImageUrl)) {
        this.addError(
          "coverImageUrl",
          "Cover image URL must be a string",
          "INVALID_TYPE"
        );
      } else if (
        input.coverImageUrl.length > 0 &&
        !ValidationUtils.isValidUrl(input.coverImageUrl)
      ) {
        this.addError(
          "coverImageUrl",
          "Cover image URL must be a valid URL",
          "INVALID_URL"
        );
      } else {
        result.coverImageUrl = input.coverImageUrl;
      }
    }

    // Validate tagIds (optional)
    if (input.tagIds !== undefined) {
      if (!ValidationUtils.isArray(input.tagIds)) {
        this.addError("tagIds", "Tag IDs must be an array", "INVALID_TYPE");
      } else {
        const tagIds = input.tagIds as unknown[];
        const validTagIds: number[] = [];

        for (let i = 0; i < tagIds.length; i++) {
          if (!ValidationUtils.isNumber(tagIds[i])) {
            this.addError(
              `tagIds[${i}]`,
              "Tag ID must be a number",
              "INVALID_TYPE"
            );
          } else if ((tagIds[i] as number) <= 0) {
            this.addError(
              `tagIds[${i}]`,
              "Tag ID must be a positive number",
              "INVALID_VALUE"
            );
          } else {
            validTagIds.push(tagIds[i] as number);
          }
        }

        if (validTagIds.length > 0) {
          result.tagIds = validTagIds;
        }
      }
    }

    // Validate readTime (optional)
    if (input.readTime !== undefined) {
      if (!ValidationUtils.isString(input.readTime)) {
        this.addError("readTime", "Read time must be a string", "INVALID_TYPE");
      } else if (input.readTime.length > 50) {
        this.addError(
          "readTime",
          "Read time cannot exceed 50 characters",
          "MAX_LENGTH"
        );
      } else {
        result.readTime = ValidationUtils.sanitizeString(input.readTime);
      }
    }

    return this.errors.length === 0 ? (result as CreatePostRequest) : null;
  }
}

// ============================================================================
// UPDATE POST VALIDATION SCHEMA
// ============================================================================

export class UpdatePostValidator extends BaseValidator<UpdatePostRequest> {
  validateData(data: unknown): UpdatePostRequest | null {
    if (!data || typeof data !== "object") {
      this.addError("root", "Request body must be an object", "INVALID_TYPE");
      return null;
    }

    const input = data as Record<string, unknown>;
    const result: UpdatePostRequest = {};

    // All fields are optional for updates, but if provided, must be valid

    // Validate title (optional)
    if (input.title !== undefined) {
      if (!ValidationUtils.isString(input.title)) {
        this.addError("title", "Title must be a string", "INVALID_TYPE");
      } else if (input.title.trim().length === 0) {
        this.addError("title", "Title cannot be empty", "EMPTY_VALUE");
      } else if (input.title.length > 255) {
        this.addError(
          "title",
          "Title cannot exceed 255 characters",
          "MAX_LENGTH"
        );
      } else {
        result.title = ValidationUtils.sanitizeString(input.title);
      }
    }

    // Validate content (optional)
    if (input.content !== undefined) {
      if (!ValidationUtils.isString(input.content)) {
        this.addError("content", "Content must be a string", "INVALID_TYPE");
      } else if (input.content.trim().length === 0) {
        this.addError("content", "Content cannot be empty", "EMPTY_VALUE");
      } else {
        result.content = ValidationUtils.sanitizeString(input.content);
      }
    }

    // Validate categoryId (optional)
    if (input.categoryId !== undefined) {
      if (!ValidationUtils.isNumber(input.categoryId)) {
        this.addError(
          "categoryId",
          "Category ID must be a number",
          "INVALID_TYPE"
        );
      } else if (input.categoryId <= 0) {
        this.addError(
          "categoryId",
          "Category ID must be a positive number",
          "INVALID_VALUE"
        );
      } else {
        result.categoryId = input.categoryId;
      }
    }

    // Validate description (optional)
    if (input.description !== undefined) {
      if (!ValidationUtils.isString(input.description)) {
        this.addError(
          "description",
          "Description must be a string",
          "INVALID_TYPE"
        );
      } else if (input.description.length > 500) {
        this.addError(
          "description",
          "Description cannot exceed 500 characters",
          "MAX_LENGTH"
        );
      } else {
        result.description = ValidationUtils.sanitizeString(input.description);
      }
    }

    // Validate coverImageUrl (optional)
    if (input.coverImageUrl !== undefined) {
      if (!ValidationUtils.isString(input.coverImageUrl)) {
        this.addError(
          "coverImageUrl",
          "Cover image URL must be a string",
          "INVALID_TYPE"
        );
      } else if (
        input.coverImageUrl.length > 0 &&
        !ValidationUtils.isValidUrl(input.coverImageUrl)
      ) {
        this.addError(
          "coverImageUrl",
          "Cover image URL must be a valid URL",
          "INVALID_URL"
        );
      } else {
        result.coverImageUrl = input.coverImageUrl;
      }
    }

    // Validate tagIds (optional)
    if (input.tagIds !== undefined) {
      if (!ValidationUtils.isArray(input.tagIds)) {
        this.addError("tagIds", "Tag IDs must be an array", "INVALID_TYPE");
      } else {
        const tagIds = input.tagIds as unknown[];
        const validTagIds: number[] = [];

        for (let i = 0; i < tagIds.length; i++) {
          if (!ValidationUtils.isNumber(tagIds[i])) {
            this.addError(
              `tagIds[${i}]`,
              "Tag ID must be a number",
              "INVALID_TYPE"
            );
          } else if ((tagIds[i] as number) <= 0) {
            this.addError(
              `tagIds[${i}]`,
              "Tag ID must be a positive number",
              "INVALID_VALUE"
            );
          } else {
            validTagIds.push(tagIds[i] as number);
          }
        }

        result.tagIds = validTagIds;
      }
    }

    // Validate readTime (optional)
    if (input.readTime !== undefined) {
      if (!ValidationUtils.isString(input.readTime)) {
        this.addError("readTime", "Read time must be a string", "INVALID_TYPE");
      } else if (input.readTime.length > 50) {
        this.addError(
          "readTime",
          "Read time cannot exceed 50 characters",
          "MAX_LENGTH"
        );
      } else {
        result.readTime = ValidationUtils.sanitizeString(input.readTime);
      }
    }

    return this.errors.length === 0 ? result : null;
  }
}

// ============================================================================
// QUERY PARAMETERS VALIDATION SCHEMA
// ============================================================================

export class QueryParamsValidator extends BaseValidator<ListPostsQuery> {
  validateData(data: unknown): ListPostsQuery | null {
    if (!data || typeof data !== "object") {
      this.addError(
        "root",
        "Query parameters must be an object",
        "INVALID_TYPE"
      );
      return null;
    }

    const input = data as Record<string, unknown>;
    const result: ListPostsQuery = {};

    // Validate page (optional)
    if (input.page !== undefined) {
      const page = parseInt(String(input.page), 10);
      if (isNaN(page) || page < 1) {
        this.addError(
          "page",
          "Page must be a positive integer",
          "INVALID_VALUE"
        );
      } else {
        result.page = page;
      }
    }

    // Validate limit (optional)
    if (input.limit !== undefined) {
      const limit = parseInt(String(input.limit), 10);
      if (isNaN(limit) || limit < 1) {
        this.addError(
          "limit",
          "Limit must be a positive integer",
          "INVALID_VALUE"
        );
      } else if (limit > 100) {
        this.addError("limit", "Limit cannot exceed 100", "MAX_VALUE");
      } else {
        result.limit = limit;
      }
    }

    // Validate categoryId (optional)
    if (input.categoryId !== undefined) {
      const categoryId = parseInt(String(input.categoryId), 10);
      if (isNaN(categoryId) || categoryId < 1) {
        this.addError(
          "categoryId",
          "Category ID must be a positive integer",
          "INVALID_VALUE"
        );
      } else {
        result.categoryId = categoryId;
      }
    }

    // Validate tagIds (optional, comma-separated string)
    if (input.tagIds !== undefined) {
      if (!ValidationUtils.isString(input.tagIds)) {
        this.addError(
          "tagIds",
          "Tag IDs must be a comma-separated string",
          "INVALID_TYPE"
        );
      } else {
        const tagIds = ValidationUtils.parseIntegerArray(input.tagIds);
        if (tagIds.length === 0 && input.tagIds.trim().length > 0) {
          this.addError(
            "tagIds",
            "Tag IDs must be valid integers",
            "INVALID_VALUE"
          );
        } else {
          result.tagIds = input.tagIds;
        }
      }
    }

    // Validate authorId (optional)
    if (input.authorId !== undefined) {
      if (!ValidationUtils.isString(input.authorId)) {
        this.addError("authorId", "Author ID must be a string", "INVALID_TYPE");
      } else if (input.authorId.trim().length === 0) {
        this.addError("authorId", "Author ID cannot be empty", "EMPTY_VALUE");
      } else {
        result.authorId = ValidationUtils.sanitizeString(input.authorId);
      }
    }

    // Validate search (optional)
    if (input.search !== undefined) {
      if (!ValidationUtils.isString(input.search)) {
        this.addError("search", "Search must be a string", "INVALID_TYPE");
      } else if (input.search.length > 255) {
        this.addError(
          "search",
          "Search cannot exceed 255 characters",
          "MAX_LENGTH"
        );
      } else {
        result.search = ValidationUtils.sanitizeString(input.search);
      }
    }

    // Validate sortBy (optional)
    if (input.sortBy !== undefined) {
      if (!ValidationUtils.isString(input.sortBy)) {
        this.addError("sortBy", "Sort by must be a string", "INVALID_TYPE");
      } else if (
        !["publishedAt", "createdAt", "title"].includes(input.sortBy)
      ) {
        this.addError(
          "sortBy",
          "Sort by must be one of: publishedAt, createdAt, title",
          "INVALID_VALUE"
        );
      } else {
        result.sortBy = input.sortBy as "publishedAt" | "createdAt" | "title";
      }
    }

    // Validate sortOrder (optional)
    if (input.sortOrder !== undefined) {
      if (!ValidationUtils.isString(input.sortOrder)) {
        this.addError(
          "sortOrder",
          "Sort order must be a string",
          "INVALID_TYPE"
        );
      } else if (!["asc", "desc"].includes(input.sortOrder)) {
        this.addError(
          "sortOrder",
          "Sort order must be either 'asc' or 'desc'",
          "INVALID_VALUE"
        );
      } else {
        result.sortOrder = input.sortOrder as "asc" | "desc";
      }
    }

    return this.errors.length === 0 ? result : null;
  }
}

// ============================================================================
// VALIDATION SCHEMAS FACTORY
// ============================================================================

export const validationSchemas = {
  createPost: new CreatePostValidator(),
  updatePost: new UpdatePostValidator(),
  queryParams: new QueryParamsValidator(),
} as const;

export type ValidationSchemas = typeof validationSchemas;
