import type { HttpClient } from '../utils/request';
import type {
  ApiResponse,
  PaginationOptions,
} from '../types';
import type {
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
  CollectionMembership,
  CollectionGroup,
} from '../types/collection';
import type { Document } from '../types/document';

export class CollectionsAPI {
  constructor(private readonly httpClient: HttpClient) {}

  async list(options: PaginationOptions = {}): Promise<ApiResponse<Collection[]>> {
    return this.httpClient.request<Collection[], PaginationOptions>('/collections.list', {
      body: options,
    });
  }

  async info(id: string): Promise<ApiResponse<Collection>> {
    return this.httpClient.request<Collection>('/collections.info', {
      body: { id },
    });
  }

  async documents(id: string, options: PaginationOptions = {}): Promise<ApiResponse<Document[]>> {
    return this.httpClient.request<Document[]>('/collections.documents', {
      body: {
        id,
        ...options,
      },
    });
  }

  async create(data: CreateCollectionData): Promise<ApiResponse<Collection>> {
    return this.httpClient.request<Collection, CreateCollectionData>('/collections.create', {
      body: data,
    });
  }

  async update(id: string, data: UpdateCollectionData): Promise<ApiResponse<Collection>> {
    return this.httpClient.request<Collection>('/collections.update', {
      body: {
        id,
        ...data,
      },
    });
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return this.httpClient.request<void>('/collections.delete', {
      body: { id },
    });
  }

  async export(id: string, format: 'outline-markdown' | 'json' = 'outline-markdown'): Promise<ApiResponse<{ fileUrl: string }>> {
    return this.httpClient.request<{ fileUrl: string }>('/collections.export', {
      body: { id, format },
    });
  }

  async exportAll(format: 'outline-markdown' | 'json' = 'outline-markdown'): Promise<ApiResponse<{ fileUrl: string }>> {
    return this.httpClient.request<{ fileUrl: string }>('/collections.export_all', {
      body: { format },
    });
  }

  async memberships(id: string, options: PaginationOptions = {}): Promise<ApiResponse<CollectionMembership[]>> {
    return this.httpClient.request<CollectionMembership[]>('/collections.memberships', {
      body: {
        id,
        ...options,
      },
    });
  }

  async addUser(id: string, userId: string, permission: 'read' | 'read_write' = 'read'): Promise<ApiResponse<CollectionMembership>> {
    return this.httpClient.request<CollectionMembership>('/collections.add_user', {
      body: {
        id,
        userId,
        permission,
      },
    });
  }

  async removeUser(id: string, userId: string): Promise<ApiResponse<void>> {
    return this.httpClient.request<void>('/collections.remove_user', {
      body: {
        id,
        userId,
      },
    });
  }

  async addGroup(id: string, groupId: string, permission: 'read' | 'read_write' = 'read'): Promise<ApiResponse<CollectionGroup>> {
    return this.httpClient.request<CollectionGroup>('/collections.add_group', {
      body: {
        id,
        groupId,
        permission,
      },
    });
  }

  async removeGroup(id: string, groupId: string): Promise<ApiResponse<void>> {
    return this.httpClient.request<void>('/collections.remove_group', {
      body: {
        id,
        groupId,
      },
    });
  }

  async *iterate(): AsyncGenerator<Collection, void, unknown> {
    let offset = 0;
    const limit = 25;
    let hasMore = true;

    while (hasMore) {
      const response = await this.list({
        offset,
        limit,
      });

      if (!response.ok || !response.data) {
        break;
      }

      for (const collection of response.data) {
        yield collection;
      }

      hasMore = response.data.length === limit;
      offset += limit;
    }
  }
}