import type { HttpClient } from '../utils/request';
import type {
  ApiResponse,
  PaginationOptions,
  SearchOptions,
} from '../types';
import type {
  Document,
  CreateDocumentData,
  UpdateDocumentData,
  MoveDocumentData,
  ExportFormat,
  DocumentSearchResult,
  DocumentListOptions,
} from '../types/document';

export class DocumentsAPI {
  constructor(private readonly httpClient: HttpClient) {}

  async list(options: DocumentListOptions & PaginationOptions = {}): Promise<ApiResponse<Document[]>> {
    return this.httpClient.request<Document[]>('/documents.list', {
      body: options,
    });
  }

  async info(id: string): Promise<ApiResponse<Document>> {
    return this.httpClient.request<Document>('/documents.info', {
      body: { id },
    });
  }

  async search(query: string, options: SearchOptions = {}): Promise<ApiResponse<DocumentSearchResult[]>> {
    return this.httpClient.request<DocumentSearchResult[]>('/documents.search', {
      body: {
        query,
        ...options,
      },
    });
  }

  async create(data: CreateDocumentData): Promise<ApiResponse<Document>> {
    return this.httpClient.request<Document>('/documents.create', {
      body: data,
    });
  }

  async update(id: string, data: UpdateDocumentData): Promise<ApiResponse<Document>> {
    return this.httpClient.request<Document>('/documents.update', {
      body: {
        id,
        ...data,
      },
    });
  }

  async delete(id: string, permanent: boolean = false): Promise<ApiResponse<void>> {
    return this.httpClient.request<void>('/documents.delete', {
      body: { id, permanent },
    });
  }

  async archive(id: string): Promise<ApiResponse<Document>> {
    return this.httpClient.request<Document>('/documents.archive', {
      body: { id },
    });
  }

  async unarchive(id: string): Promise<ApiResponse<Document>> {
    return this.httpClient.request<Document>('/documents.unarchive', {
      body: { id },
    });
  }

  async move(id: string, data: MoveDocumentData): Promise<ApiResponse<Document[]>> {
    return this.httpClient.request<Document[]>('/documents.move', {
      body: {
        id,
        ...data,
      },
    });
  }

  async export(id: string, format: ExportFormat = 'markdown'): Promise<ApiResponse<{ data: string }>> {
    return this.httpClient.request<{ data: string }>('/documents.export', {
      body: { id, format },
    });
  }

  async restore(id: string, revision?: number): Promise<ApiResponse<Document>> {
    return this.httpClient.request<Document>('/documents.restore', {
      body: { id, revision },
    });
  }

  async star(id: string): Promise<ApiResponse<void>> {
    return this.httpClient.request<void>('/documents.star', {
      body: { id },
    });
  }

  async unstar(id: string): Promise<ApiResponse<void>> {
    return this.httpClient.request<void>('/documents.unstar', {
      body: { id },
    });
  }

  async viewed(id: string): Promise<ApiResponse<Document[]>> {
    return this.httpClient.request<Document[]>('/documents.viewed', {
      body: { id },
    });
  }

  async *iterate(options: DocumentListOptions = {}): AsyncGenerator<Document, void, unknown> {
    let offset = 0;
    const limit = 25;
    let hasMore = true;

    while (hasMore) {
      const response = await this.list({
        ...options,
        offset,
        limit,
      });

      if (!response.ok || !response.data) {
        break;
      }

      for (const document of response.data) {
        yield document;
      }

      hasMore = response.data.length === limit;
      offset += limit;
    }
  }
}