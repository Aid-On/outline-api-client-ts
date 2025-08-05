import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OutlineClient } from '../../client';
import { OutlineAPIError } from '../../utils/error';
import { createTestClient, createMockFetch, mockUser, mockTeam } from '../test-utils';

describe('AuthAPI', () => {
  let client: OutlineClient;
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(() => {
    mockFetch = createMockFetch();
    client = new OutlineClient(createTestClient({ fetchImplementation: mockFetch }));
  });

  describe('info', () => {
    it('should get auth info', async () => {
      const authInfo = {
        user: mockUser,
        team: mockTeam,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: authInfo,
        }),
      });

      const result = await client.auth.info();

      expect(result.ok).toBe(true);
      expect(result.data?.user.id).toBe('user-123');
      expect(result.data?.user.name).toBe('Test User');
      expect(result.data?.team.id).toBe('team-123');
      expect(result.data?.team.name).toBe('Test Team');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/auth.info',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });

    it('should handle unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({
          error: 'unauthorized',
          message: 'Invalid API key',
        }),
      });

      await expect(client.auth.info()).rejects.toThrow(OutlineAPIError);
    });
  });

  describe('apiKeys', () => {
    it('should list API keys', async () => {
      const mockApiKey = {
        id: 'key-123',
        name: 'Test API Key',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastActiveAt: '2024-01-01T12:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: [mockApiKey],
        }),
      });

      const result = await client.auth.apiKeys();

      expect(result.ok).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe('key-123');
      expect(result.data?.[0].name).toBe('Test API Key');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/apiKeys.list',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });
  });

  describe('createApiKey', () => {
    it('should create an API key', async () => {
      const mockApiKey = {
        id: 'key-456',
        name: 'New API Key',
        secret: 'sk_test_1234567890',
        createdAt: '2024-01-02T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: mockApiKey,
        }),
      });

      const result = await client.auth.createApiKey('New API Key');

      expect(result.ok).toBe(true);
      expect(result.data?.id).toBe('key-456');
      expect(result.data?.name).toBe('New API Key');
      expect(result.data?.secret).toBe('sk_test_1234567890');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/apiKeys.create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New API Key' }),
        })
      );
    });

    it('should handle validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          error: 'validation_error',
          message: 'Name is required',
        }),
      });

      await expect(client.auth.createApiKey('')).rejects.toThrow(OutlineAPIError);
    });
  });

  describe('deleteApiKey', () => {
    it('should delete an API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
        }),
      });

      const result = await client.auth.deleteApiKey('key-123');

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/apiKeys.delete',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ id: 'key-123' }),
        })
      );
    });

    it('should handle not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({
          error: 'not_found',
          message: 'API key not found',
        }),
      });

      await expect(client.auth.deleteApiKey('invalid-key')).rejects.toThrow(OutlineAPIError);
    });
  });

  describe('client.ping', () => {
    it('should return true when API is accessible', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: {
            user: mockUser,
            team: mockTeam,
          },
        }),
      });

      const result = await client.ping();

      expect(result).toBe(true);
    });

    it('should return false when API is not accessible', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({
          error: 'unauthorized',
        }),
      });

      const result = await client.ping();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      // Create a client with no retries for this test
      const noRetryClient = new OutlineClient(createTestClient({ 
        fetchImplementation: mockFetch,
        retryAttempts: 1 
      }));
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await noRetryClient.ping();

      expect(result).toBe(false);
    });
  });
});