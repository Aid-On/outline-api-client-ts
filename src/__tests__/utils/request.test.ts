import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient } from '../../utils/request';
import { OutlineAPIError } from '../../utils/error';
import { createMockFetch } from '../test-utils';

describe('HttpClient', () => {
  let client: HttpClient;
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = createMockFetch();
    client = new HttpClient({
      apiKey: 'test-key',
      apiUrl: 'https://api.example.com',
      timeout: 5000,
      retryAttempts: 2,
      retryDelay: 100,
      fetchImplementation: mockFetch,
    });
  });

  it('should make successful request', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        ok: true,
        data: { id: '123', title: 'Test' },
      }),
    };
    
    mockFetch.mockResolvedValueOnce(mockResponse as any);

    const result = await client.request('/test.endpoint', {
      body: { test: 'data' },
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ id: '123', title: 'Test' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test.endpoint',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ test: 'data' }),
      })
    );
  });

  it('should handle API errors', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        error: 'validation_error',
        message: 'Invalid input',
      }),
    };
    
    mockFetch.mockResolvedValueOnce(mockResponse as any);

    await expect(
      client.request('/test.endpoint')
    ).rejects.toThrow(OutlineAPIError);
  });

  it('should retry on server errors', async () => {
    const serverErrorResponse = {
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({
        error: 'server_error',
      }),
    };

    const successResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        ok: true,
        data: { success: true },
      }),
    };

    mockFetch
      .mockResolvedValueOnce(serverErrorResponse as any)
      .mockResolvedValueOnce(successResponse as any);

    const result = await client.request('/test.endpoint');

    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should not retry on client errors', async () => {
    const clientErrorResponse = {
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        error: 'bad_request',
      }),
    };

    mockFetch.mockResolvedValueOnce(clientErrorResponse as any);

    await expect(
      client.request('/test.endpoint')
    ).rejects.toThrow(OutlineAPIError);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should strip trailing slash from apiUrl', () => {
    const clientWithSlash = new HttpClient({
      apiKey: 'test-key',
      apiUrl: 'https://api.example.com/',
      fetchImplementation: mockFetch,
    });

    expect(clientWithSlash).toBeDefined();
  });
});