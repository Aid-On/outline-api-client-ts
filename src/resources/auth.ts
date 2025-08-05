import type { HttpClient } from '../utils/request';
import type { ApiResponse } from '../types';
import type { AuthInfo, ApiKey } from '../types/auth';

export class AuthAPI {
  constructor(private readonly httpClient: HttpClient) {}

  async info(): Promise<ApiResponse<AuthInfo>> {
    return this.httpClient.request<AuthInfo>('/auth.info');
  }

  async apiKeys(): Promise<ApiResponse<ApiKey[]>> {
    return this.httpClient.request<ApiKey[]>('/apiKeys.list');
  }

  async createApiKey(name: string): Promise<ApiResponse<ApiKey>> {
    return this.httpClient.request<ApiKey>('/apiKeys.create', {
      body: { name },
    });
  }

  async deleteApiKey(id: string): Promise<ApiResponse<void>> {
    return this.httpClient.request<void>('/apiKeys.delete', {
      body: { id },
    });
  }
}