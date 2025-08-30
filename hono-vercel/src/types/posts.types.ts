/**
 * Core types and interfaces for the Posts CRUD API
 * This file defines all TypeScript interfaces for request/response DTOs,
 * service contracts, validation schemas, and error response types.
 */

// ============================================================================
// DATABASE ENTITY TYPES (inferred from schema)
// ============================================================================

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  content: string | null;
  description: string | null;
  readTime: string | null;
  publishedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  authorId: string;
  categoryId: number;
}

export interface PostToTag {
  postId: number;
  tagId: number;
}

// ============================================================================
// REQUEST DTO TYPES
// ============================================================================

export interface CreatePostRequest {
  title: string;
  content: string;
  description?: string;
  coverImageUrl?: string;
  categoryId: number;
  tagIds?: number[];
  readTime?: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  description?: string;
  coverImageUrl?: string;
  categoryId?: number;
  tagIds?: number[];
  readTime?: string;
}

export interface ListPostsQuery {
  page?: number;
  limit?: number;
  categoryId?: number;
  tagIds?: string; // comma-separated tag IDs
  authorId?: string;
  search?: string; // search in title/content
  sortBy?: "publishedAt" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// RESPONSE DTO TYPES
// ============================================================================

export interface PostResponse {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  description: string | null;
  coverImageUrl: string | null;
  readTime: string | null;
  publishedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedPostsResponse {
  data: PostResponse[];
  pagination: PaginationMeta;
}

// ============================================================================
// SERVICE LAYER TYPES
// ============================================================================

export interface PostWithRelations {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  description: string | null;
  coverImageUrl: string | null;
  readTime: string | null;
  publishedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  authorId: string;
  categoryId: number;
  author: User;
  category: Category;
  postsToTags: Array<{
    postId: number;
    tagId: number;
    tag: Tag;
  }>;
}

export interface FindManyOptions {
  page?: number;
  limit?: number;
  categoryId?: number;
  tagIds?: number[];
  authorId?: string;
  search?: string;
  sortBy?: "publishedAt" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface CreatePostData {
  title: string;
  content: string;
  description?: string;
  coverImageUrl?: string;
  categoryId: number;
  authorId: string;
  tagIds?: number[];
  readTime?: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  description?: string;
  coverImageUrl?: string;
  categoryId?: number;
  tagIds?: number[];
  readTime?: string;
}

// ============================================================================
// SERVICE CONTRACT INTERFACES
// ============================================================================

export interface PostsService {
  findMany(
    options: FindManyOptions
  ): Promise<{ posts: PostWithRelations[]; total: number }>;
  findById(id: number): Promise<PostWithRelations | null>;
  create(data: CreatePostData): Promise<PostWithRelations>;
  update(id: number, data: UpdatePostData): Promise<PostWithRelations>;
  delete(id: number): Promise<void>;
}

export interface PostsController {
  getAllPosts(c: any): Promise<Response>;
  getPostById(c: any): Promise<Response>;
  createPost(c: any): Promise<Response>;
  updatePost(c: any): Promise<Response>;
  deletePost(c: any): Promise<Response>;
}

// ============================================================================
// ERROR RESPONSE TYPES
// ============================================================================

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>; // For validation errors
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, string[]>;
}

// ============================================================================
// VALIDATION SCHEMA TYPES
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationSchema<T> {
  validate(data: unknown): ValidationResult<T>;
}

export interface ValidationSchemas {
  createPost: ValidationSchema<CreatePostRequest>;
  updatePost: ValidationSchema<UpdatePostRequest>;
  queryParams: ValidationSchema<ListPostsQuery>;
}

// ============================================================================
// DATABASE QUERY TYPES
// ============================================================================

export interface DatabaseQueryOptions {
  where?: Record<string, any>;
  orderBy?: Record<string, "asc" | "desc">;
  limit?: number;
  offset?: number;
  with?: Record<string, boolean | object>;
}

export interface PostQueryBuilder {
  where(conditions: Record<string, any>): PostQueryBuilder;
  orderBy(field: string, direction: "asc" | "desc"): PostQueryBuilder;
  limit(count: number): PostQueryBuilder;
  offset(count: number): PostQueryBuilder;
  withRelations(relations: string[]): PostQueryBuilder;
  execute(): Promise<PostWithRelations[]>;
  count(): Promise<number>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type PostSortField = "publishedAt" | "createdAt" | "title";
export type SortOrder = "asc" | "desc";

export interface SlugGenerationOptions {
  title: string;
  existingSlugs?: string[];
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult {
  offset: number;
  limit: number;
  page: number;
  totalPages: number;
}

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

// ============================================================================
// ERROR CODES
// ============================================================================

export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  DUPLICATE_SLUG = "DUPLICATE_SLUG",
  FOREIGN_KEY_CONSTRAINT = "FOREIGN_KEY_CONSTRAINT",
  DATABASE_ERROR = "DATABASE_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}
