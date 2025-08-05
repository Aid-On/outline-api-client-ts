import { vi } from 'vitest';
import type { OutlineClientOptions } from '../types';

export interface MockFetchOptions {
  status?: number;
  ok?: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

export function createMockFetch(options: MockFetchOptions = {}): ReturnType<typeof vi.fn> {
  const { status = 200, ok = true, data, error, message } = options;

  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue({
      ok,
      data,
      error,
      message,
    }),
  });
}

export function createTestClient(options: Partial<OutlineClientOptions> = {}): OutlineClientOptions {
  return {
    apiKey: 'test-api-key',
    apiUrl: 'https://test.outline.com/api',
    fetchImplementation: createMockFetch(),
    ...options,
  };
}

export const mockDocument = {
  id: 'doc-123',
  url: 'https://outline.com/doc/test',
  urlId: 'test',
  title: 'Test Document',
  text: '# Test Document\n\nContent',
  html: '<h1>Test Document</h1><p>Content</p>',
  emoji: '📄',
  collectionId: 'col-123',
  parentDocumentId: null,
  revision: 1,
  fullWidth: false,
  createdBy: {
    id: 'user-123',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  updatedBy: {
    id: 'user-123',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  publishedAt: '2024-01-01T00:00:00.000Z',
  teamId: 'team-123',
  template: false,
  collaboratorIds: [],
};

export const mockCollection = {
  id: 'col-123',
  name: 'Test Collection',
  description: 'Test collection description',
  url: 'https://outline.com/collection/test',
  urlId: 'test',
  color: '#4285F4',
  icon: '📁',
  sort: { field: 'title' as const, direction: 'asc' as const },
  index: 'Aa',
  permission: 'read_write' as const,
  sharing: true,
  createdBy: {
    id: 'user-123',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  updatedBy: {
    id: 'user-123',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  isAdmin: false,
  isSuspended: false,
  language: 'en',
  lastActiveAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const mockTeam = {
  id: 'team-123',
  name: 'Test Team',
  avatarUrl: 'https://example.com/team-avatar.jpg',
  sharing: true,
  collaborativeEditing: true,
  guestSignin: false,
  subdomain: 'test',
  url: 'https://test.getoutline.com',
  defaultUserRole: 'member' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};