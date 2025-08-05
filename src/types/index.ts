export interface OutlineClientOptions {
  apiKey: string;
  apiUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  fetchImplementation?: typeof fetch;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  status: number;
  pagination?: Pagination;
}

export interface Pagination {
  offset: number;
  limit: number;
  nextPath?: string;
  total?: number;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface SearchOptions extends PaginationOptions {
  collectionId?: string;
  userId?: string;
  includeArchived?: boolean;
  includeDrafts?: boolean;
  dateFilter?: 'day' | 'week' | 'month' | 'year';
  snippet?: boolean;
}

export interface ApiError {
  error: string;
  message?: string;
  data?: Record<string, unknown>;
}