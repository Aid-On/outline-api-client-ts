import { fetch } from 'undici';
import type { ApiResponse, ApiError } from '../types';
import { OutlineAPIError } from './error';

export interface HttpClientOptions {
  apiKey: string;
  apiUrl: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  fetchImplementation?: typeof fetch;
}

export class HttpClient {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;
  private readonly fetch: typeof fetch;

  constructor(options: HttpClientOptions) {
    this.apiKey = options.apiKey;
    this.apiUrl = options.apiUrl.replace(/\/$/, '');
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.fetch = options.fetchImplementation || fetch;
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.apiUrl}${endpoint}`;
    const { method = 'POST', body } = options;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const requestBody = body ? JSON.stringify(body) : undefined;

    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await this.fetch(url, {
          method,
          headers,
          body: requestBody,
          signal: AbortSignal.timeout(this.timeout),
        });

        const responseData = await response.json() as ApiResponse<T> | ApiError;

        if (!response.ok) {
          const error = responseData as ApiError;
          throw OutlineAPIError.fromResponse(response.status, error);
        }

        return {
          ...(responseData as ApiResponse<T>),
          status: response.status,
        };

      } catch (error) {
        lastError = error as Error;

        if (error instanceof OutlineAPIError && !error.isServerError() && !error.isRateLimitError()) {
          throw error;
        }

        if (attempt < this.retryAttempts - 1) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, any>;
}