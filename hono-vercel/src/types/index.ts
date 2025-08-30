/**
 * Main types export file for Posts CRUD API
 * This file re-exports all types, interfaces, and utilities for easy importing
 */

// ============================================================================
// CORE TYPES AND INTERFACES
// ============================================================================

export type {
  ApiError,
  Category,
  CreatePostData,
  // Request DTO types
  CreatePostRequest,
  // Database query types
  DatabaseQueryOptions,
  // Error response types
  ErrorResponse,
  FindManyOptions,
  ListPostsQuery,
  PaginatedPostsResponse,
  PaginationMeta,
  PaginationOptions,
  PaginationResult,
  Post,
  PostQueryBuilder,
  // Response DTO types
  PostResponse,
  // Utility types
  PostSortField,
  PostToTag,
  // Service layer types
  PostWithRelations,
  PostsController,
  // Service contract interfaces
  PostsService,
  SlugGenerationOptions,
  SortOrder,
  Tag,
  UpdatePostData,
  UpdatePostRequest,
  // Database entity types
  User,
  ValidationError,
  // Validation types
  ValidationResult,
  ValidationSchema,
  ValidationSchemas,
} from "./posts.types";

// ============================================================================
// ENUMS
// ============================================================================

export { ErrorCode, HttpStatusCode } from "./posts.types";

// ============================================================================
// VALIDATION SCHEMAS AND UTILITIES
// ============================================================================

export {
  BaseValidator,

  // Specific validators
  CreatePostValidator,
  QueryParamsValidator,
  UpdatePostValidator,
  // Validation utilities
  ValidationUtils,
  // Validation schemas factory
  validationSchemas,
  type ValidationSchemas as ValidationSchemasType,
} from "./validation.schemas";

// ============================================================================
// ERROR TYPES AND UTILITIES
// ============================================================================

export {
  // Custom error classes
  ApiError as ApiErrorClass,
  ConflictError,
  DatabaseError,
  DuplicateSlugError,
  // Error factory
  ErrorFactory,
  // Error response builders
  ErrorResponseBuilder,
  // Error utilities
  ErrorUtils,
  ForeignKeyConstraintError,
  NotFoundError,
  ValidationApiError,
  isDatabaseError,
  isDuplicateSlugError,
  isForeignKeyConstraintError,
  isNotFoundError,
  // Type guards
  isValidationError,
} from "./errors.types";

// ============================================================================
// COMMONLY USED TYPE COMBINATIONS
// ============================================================================

// For service method return types
export type ServiceResult<T> = Promise<T>;
export type ServiceListResult<T> = Promise<{ data: T[]; total: number }>;

// For controller method parameters
export type ControllerContext = any; // Will be replaced with proper Hono Context type

// For database operation results
export type DatabaseResult<T> = T | null;
export type DatabaseListResult<T> = { items: T[]; total: number };

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_SORT_FIELD: PostSortField = "publishedAt";
export const DEFAULT_SORT_ORDER: SortOrder = "desc";

// ============================================================================
// UTILITY TYPE HELPERS
// ============================================================================

// Helper type for partial updates
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Helper type for required fields in create operations
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Helper type for optional fields in update operations
export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// Helper type for database entity with timestamps
export type WithTimestamps<T> = T & {
  createdAt: Date | null;
  updatedAt: Date | null;
};

// Helper type for database entity with relations
export type WithRelations<T, R> = T & R;
