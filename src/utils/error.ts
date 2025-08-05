import type { ApiError } from '../types';

export class OutlineAPIError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly data?: Record<string, unknown>;

  constructor(message: string, status: number, error?: ApiError) {
    super(message);
    this.name = 'OutlineAPIError';
    this.status = status;
    this.code = error?.error;
    this.data = error?.data;
  }

  static fromResponse(status: number, error?: ApiError): OutlineAPIError {
    const message = error?.message || error?.error || `API request failed with status ${status}`;
    return new OutlineAPIError(message, status, error);
  }

  isRateLimitError(): boolean {
    return this.status === 429;
  }

  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  isNotFoundError(): boolean {
    return this.status === 404;
  }

  isValidationError(): boolean {
    return this.status === 400;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }
}