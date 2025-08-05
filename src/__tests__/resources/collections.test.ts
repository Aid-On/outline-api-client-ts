import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OutlineClient } from '../../client';
import { OutlineAPIError } from '../../utils/error';
import { createTestClient, createMockFetch, mockCollection, mockDocument } from '../test-utils';

describe('CollectionsAPI', () => {
  let client: OutlineClient;
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(() => {
    mockFetch = createMockFetch();
    client = new OutlineClient(createTestClient({ fetchImplementation: mockFetch }));
  });

  describe('list', () => {
    it('should list collections', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: [mockCollection],
          pagination: { offset: 0, limit: 25 },
        }),
      });

      const result = await client.collections.list();

      expect(result.ok).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe('col-123');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/collections.list',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({}),
        })
      );
    });

    it('should list collections with pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: [mockCollection],
        }),
      });

      await client.collections.list({ limit: 10, offset: 20 });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/collections.list',
        expect.objectContaining({
          body: JSON.stringify({ limit: 10, offset: 20 }),
        })
      );
    });
  });

  describe('info', () => {
    it('should get collection info', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: mockCollection,
        }),
      });

      const result = await client.collections.info('col-123');

      expect(result.ok).toBe(true);
      expect(result.data?.id).toBe('col-123');
      expect(result.data?.name).toBe('Test Collection');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/collections.info',
        expect.objectContaining({
          body: JSON.stringify({ id: 'col-123' }),
        })
      );
    });

    it('should handle not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({
          error: 'not_found',
          message: 'Collection not found',
        }),
      });

      await expect(client.collections.info('invalid-id')).rejects.toThrow(OutlineAPIError);
    });
  });

  describe('documents', () => {
    it('should get collection documents', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: [mockDocument],
        }),
      });

      const result = await client.collections.documents('col-123');

      expect(result.ok).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/collections.documents',
        expect.objectContaining({
          body: JSON.stringify({ id: 'col-123' }),
        })
      );
    });

    it('should get documents with pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: [],
        }),
      });

      await client.collections.documents('col-123', { limit: 50, offset: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/collections.documents',
        expect.objectContaining({
          body: JSON.stringify({ id: 'col-123', limit: 50, offset: 10 }),
        })
      );
    });
  });

  describe('create', () => {
    it('should create a collection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: mockCollection,
        }),
      });

      const result = await client.collections.create({
        name: 'New Collection',
        description: 'Collection description',
        color: '#4285F4',
        permission: 'read_write',
      });

      expect(result.ok).toBe(true);
      expect(result.data?.name).toBe('Test Collection');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/collections.create',
        expect.objectContaining({
          body: JSON.stringify({
            name: 'New Collection',
            description: 'Collection description',
            color: '#4285F4',
            permission: 'read_write',
          }),
        })
      );
    });

    it('should handle validation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          error: 'validation_error',
          message: 'Name is required',
        }),
      });

      await expect(
        client.collections.create({ name: '' })
      ).rejects.toThrow(OutlineAPIError);
    });
  });

  describe('update', () => {
    it('should update a collection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: { ...mockCollection, name: 'Updated Collection' },
        }),
      });

      const result = await client.collections.update('col-123', {
        name: 'Updated Collection',
        color: '#FF0000',
      });

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/collections.update',
        expect.objectContaining({
          body: JSON.stringify({
            id: 'col-123',
            name: 'Updated Collection',
            color: '#FF0000',
          }),
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete a collection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
        }),
      });

      const result = await client.collections.delete('col-123');

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/collections.delete',
        expect.objectContaining({
          body: JSON.stringify({ id: 'col-123' }),
        })
      );
    });
  });

  describe('export', () => {
    it('should export a collection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: { fileUrl: 'https://download.example.com/export.zip' },
        }),
      });

      const result = await client.collections.export('col-123');

      expect(result.ok).toBe(true);
      expect(result.data?.fileUrl).toBe('https://download.example.com/export.zip');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/collections.export',
        expect.objectContaining({
          body: JSON.stringify({ id: 'col-123', format: 'outline-markdown' }),
        })
      );
    });

    it('should export with json format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: { fileUrl: 'https://download.example.com/export.json' },
        }),
      });

      await client.collections.export('col-123', 'json');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/collections.export',
        expect.objectContaining({
          body: JSON.stringify({ id: 'col-123', format: 'json' }),
        })
      );
    });
  });

  describe('exportAll', () => {
    it('should export all collections', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: { fileUrl: 'https://download.example.com/export-all.zip' },
        }),
      });

      const result = await client.collections.exportAll();

      expect(result.ok).toBe(true);
      expect(result.data?.fileUrl).toBe('https://download.example.com/export-all.zip');
    });
  });

  describe('memberships', () => {
    it('should get collection memberships', async () => {
      const mockMembership = {
        id: 'mem-123',
        userId: 'user-123',
        collectionId: 'col-123',
        permission: 'read_write' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: [mockMembership],
        }),
      });

      const result = await client.collections.memberships('col-123');

      expect(result.ok).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].permission).toBe('read_write');
    });
  });

  describe('addUser/removeUser', () => {
    it('should add user to collection', async () => {
      const mockMembership = {
        id: 'mem-123',
        userId: 'user-456',
        collectionId: 'col-123',
        permission: 'read' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: mockMembership,
        }),
      });

      const result = await client.collections.addUser('col-123', 'user-456', 'read');

      expect(result.ok).toBe(true);
      expect(result.data?.userId).toBe('user-456');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/collections.add_user',
        expect.objectContaining({
          body: JSON.stringify({
            id: 'col-123',
            userId: 'user-456',
            permission: 'read',
          }),
        })
      );
    });

    it('should remove user from collection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
        }),
      });

      const result = await client.collections.removeUser('col-123', 'user-456');

      expect(result.ok).toBe(true);
    });
  });

  describe('addGroup/removeGroup', () => {
    it('should add group to collection', async () => {
      const mockGroup = {
        id: 'grp-123',
        groupId: 'group-456',
        collectionId: 'col-123',
        permission: 'read_write' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: mockGroup,
        }),
      });

      const result = await client.collections.addGroup('col-123', 'group-456', 'read_write');

      expect(result.ok).toBe(true);
      expect(result.data?.groupId).toBe('group-456');
    });

    it('should remove group from collection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
        }),
      });

      const result = await client.collections.removeGroup('col-123', 'group-456');

      expect(result.ok).toBe(true);
    });
  });

  describe('iterate', () => {
    it('should iterate through all collections', async () => {
      const page1 = Array(25).fill(null).map((_, i) => ({ ...mockCollection, id: `col-${i}` }));
      const page2 = Array(5).fill(null).map((_, i) => ({ ...mockCollection, id: `col-${i + 25}` }));

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({
            ok: true,
            data: page1,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({
            ok: true,
            data: page2,
          }),
        });

      const collections = [];
      for await (const col of client.collections.iterate()) {
        collections.push(col);
      }

      expect(collections).toHaveLength(30);
      expect(collections[0].id).toBe('col-0');
      expect(collections[29].id).toBe('col-29');
    });
  });
});