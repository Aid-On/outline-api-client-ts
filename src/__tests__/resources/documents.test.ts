import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OutlineClient } from '../../client';
import { OutlineAPIError } from '../../utils/error';
import { createTestClient, createMockFetch, mockDocument } from '../test-utils';

describe('DocumentsAPI', () => {
  let client: OutlineClient;
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(() => {
    mockFetch = createMockFetch();
    client = new OutlineClient(createTestClient({ fetchImplementation: mockFetch }));
  });

  describe('list', () => {
    it('should list documents', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: [mockDocument],
          pagination: { offset: 0, limit: 25 },
        }),
      });

      const result = await client.documents.list({ limit: 25 });

      expect(result.ok).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe('doc-123');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/documents.list',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ limit: 25 }),
        })
      );
    });

    it('should list documents with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: [mockDocument],
        }),
      });

      await client.documents.list({
        collectionId: 'col-123',
        sort: 'updatedAt',
        direction: 'DESC',
        template: false,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/documents.list',
        expect.objectContaining({
          body: JSON.stringify({
            collectionId: 'col-123',
            sort: 'updatedAt',
            direction: 'DESC',
            template: false,
          }),
        })
      );
    });
  });

  describe('info', () => {
    it('should get document info', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: mockDocument,
        }),
      });

      const result = await client.documents.info('doc-123');

      expect(result.ok).toBe(true);
      expect(result.data?.id).toBe('doc-123');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/documents.info',
        expect.objectContaining({
          body: JSON.stringify({ id: 'doc-123' }),
        })
      );
    });

    it('should handle not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({
          error: 'not_found',
          message: 'Document not found',
        }),
      });

      await expect(client.documents.info('invalid-id')).rejects.toThrow(OutlineAPIError);
    });
  });

  describe('search', () => {
    it('should search documents', async () => {
      const searchResults = [
        { ...mockDocument, context: 'Test context', highlight: 'Test <mark>highlight</mark>' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: searchResults,
        }),
      });

      const result = await client.documents.search('test query');

      expect(result.ok).toBe(true);
      expect(result.data?.[0].context).toBe('Test context');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/documents.search',
        expect.objectContaining({
          body: JSON.stringify({ query: 'test query' }),
        })
      );
    });

    it('should search with options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: [],
        }),
      });

      await client.documents.search('query', {
        collectionId: 'col-123',
        includeArchived: true,
        includeDrafts: false,
        dateFilter: 'month',
        snippet: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/documents.search',
        expect.objectContaining({
          body: JSON.stringify({
            query: 'query',
            collectionId: 'col-123',
            includeArchived: true,
            includeDrafts: false,
            dateFilter: 'month',
            snippet: true,
          }),
        })
      );
    });
  });

  describe('create', () => {
    it('should create a document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: mockDocument,
        }),
      });

      const result = await client.documents.create({
        title: 'New Document',
        text: '# Content',
        collectionId: 'col-123',
        publish: true,
      });

      expect(result.ok).toBe(true);
      expect(result.data?.title).toBe('Test Document');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/documents.create',
        expect.objectContaining({
          body: JSON.stringify({
            title: 'New Document',
            text: '# Content',
            collectionId: 'col-123',
            publish: true,
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
          message: 'Title is required',
        }),
      });

      await expect(
        client.documents.create({
          title: '',
          text: 'Content',
          collectionId: 'col-123',
        })
      ).rejects.toThrow(OutlineAPIError);
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: { ...mockDocument, title: 'Updated Title' },
        }),
      });

      const result = await client.documents.update('doc-123', {
        title: 'Updated Title',
        text: 'Updated content',
      });

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/documents.update',
        expect.objectContaining({
          body: JSON.stringify({
            id: 'doc-123',
            title: 'Updated Title',
            text: 'Updated content',
          }),
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete a document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
        }),
      });

      const result = await client.documents.delete('doc-123');

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/documents.delete',
        expect.objectContaining({
          body: JSON.stringify({
            id: 'doc-123',
            permanent: false,
          }),
        })
      );
    });

    it('should permanently delete a document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
        }),
      });

      await client.documents.delete('doc-123', true);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/documents.delete',
        expect.objectContaining({
          body: JSON.stringify({
            id: 'doc-123',
            permanent: true,
          }),
        })
      );
    });
  });

  describe('archive/unarchive', () => {
    it('should archive a document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: { ...mockDocument, archivedAt: '2024-01-02T00:00:00.000Z' },
        }),
      });

      const result = await client.documents.archive('doc-123');

      expect(result.ok).toBe(true);
      expect(result.data?.archivedAt).toBeTruthy();
    });

    it('should unarchive a document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: { ...mockDocument, archivedAt: null },
        }),
      });

      const result = await client.documents.unarchive('doc-123');

      expect(result.ok).toBe(true);
      expect(result.data?.archivedAt).toBeNull();
    });
  });

  describe('export', () => {
    it('should export a document as markdown', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: { data: '# Test Document\n\nContent' },
        }),
      });

      const result = await client.documents.export('doc-123', 'markdown');

      expect(result.ok).toBe(true);
      expect(result.data?.data).toContain('# Test Document');
    });

    it('should export with default format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: { data: '# Test Document' },
        }),
      });

      await client.documents.export('doc-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/documents.export',
        expect.objectContaining({
          body: JSON.stringify({
            id: 'doc-123',
            format: 'markdown',
          }),
        })
      );
    });
  });

  describe('move', () => {
    it('should move a document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
          data: [mockDocument],
        }),
      });

      const result = await client.documents.move('doc-123', {
        parentDocumentId: 'parent-123',
        index: 1,
      });

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.outline.com/api/documents.move',
        expect.objectContaining({
          body: JSON.stringify({
            id: 'doc-123',
            parentDocumentId: 'parent-123',
            index: 1,
          }),
        })
      );
    });
  });

  describe('star/unstar', () => {
    it('should star a document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
        }),
      });

      const result = await client.documents.star('doc-123');

      expect(result.ok).toBe(true);
    });

    it('should unstar a document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ok: true,
        }),
      });

      const result = await client.documents.unstar('doc-123');

      expect(result.ok).toBe(true);
    });
  });

  describe('iterate', () => {
    it('should iterate through all documents', async () => {
      const page1 = Array(25).fill(null).map((_, i) => ({ ...mockDocument, id: `doc-${i}` }));
      const page2 = Array(10).fill(null).map((_, i) => ({ ...mockDocument, id: `doc-${i + 25}` }));

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

      const documents = [];
      for await (const doc of client.documents.iterate()) {
        documents.push(doc);
      }

      expect(documents).toHaveLength(35);
      expect(documents[0].id).toBe('doc-0');
      expect(documents[34].id).toBe('doc-34');
    });

    it('should stop iteration on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          error: 'server_error',
        }),
      });

      const documents = [];
      for await (const doc of client.documents.iterate()) {
        documents.push(doc);
      }

      expect(documents).toHaveLength(0);
    });
  });
});