import { useQuery } from '@tanstack/react-query'

interface UseOutlineAPIOptions {
  apiKey: string | null
  apiUrl: string
}

// Collections用のフック
export function useCollections({ apiKey, apiUrl }: UseOutlineAPIOptions) {
  return useQuery({
    queryKey: ['collections', apiKey, apiUrl],
    queryFn: async () => {
      if (!apiKey) throw new Error('API key is required')
      
      const response = await fetch(`/api/collections?action=list&includePrivate=true`, {
        headers: {
          'x-api-key': apiKey,
          'x-api-url': apiUrl,
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch collections')
      }
      
      const data = await response.json()
      return data.data || []
    },
    enabled: !!apiKey, // APIキーがある場合のみ実行
  })
}

// Document検索用のフック
export function useDocumentSearch(query: string, { apiKey, apiUrl }: UseOutlineAPIOptions) {
  return useQuery({
    queryKey: ['documents', 'search', query, apiKey, apiUrl],
    queryFn: async () => {
      if (!apiKey) throw new Error('API key is required')
      if (!query) return []
      
      const response = await fetch(`/api/documents?action=search&query=${encodeURIComponent(query)}`, {
        headers: {
          'x-api-key': apiKey,
          'x-api-url': apiUrl,
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Search failed')
      }
      
      const data = await response.json()
      return data.data || []
    },
    enabled: !!apiKey && !!query,
  })
}

// Document情報取得用のフック
export function useDocument(id: string | null, { apiKey, apiUrl }: UseOutlineAPIOptions) {
  return useQuery({
    queryKey: ['documents', 'info', id, apiKey, apiUrl],
    queryFn: async () => {
      if (!apiKey || !id) throw new Error('API key and document ID are required')
      
      const response = await fetch(`/api/documents?action=info&id=${id}`, {
        headers: {
          'x-api-key': apiKey,
          'x-api-url': apiUrl,
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch document')
      }
      
      const data = await response.json()
      return data.data
    },
    enabled: !!apiKey && !!id,
  })
}

// Collection内のドキュメント一覧取得用のフック
export function useCollectionDocuments(collectionId: string | null, { apiKey, apiUrl }: UseOutlineAPIOptions) {
  return useQuery({
    queryKey: ['documents', 'list', collectionId, apiKey, apiUrl],
    queryFn: async () => {
      if (!apiKey || !collectionId) throw new Error('API key and collection ID are required')
      
      const response = await fetch(`/api/documents?action=list&collectionId=${collectionId}`, {
        headers: {
          'x-api-key': apiKey,
          'x-api-url': apiUrl,
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch documents')
      }
      
      const data = await response.json()
      return data.data || []
    },
    enabled: !!apiKey && !!collectionId,
  })
}

// Collection情報取得用のフック
export function useCollectionInfo(collectionId: string | null, { apiKey, apiUrl }: UseOutlineAPIOptions) {
  return useQuery({
    queryKey: ['collections', 'info', collectionId, apiKey, apiUrl],
    queryFn: async () => {
      if (!apiKey || !collectionId) throw new Error('API key and collection ID are required')
      
      const response = await fetch(`/api/collections?action=info&id=${collectionId}`, {
        headers: {
          'x-api-key': apiKey,
          'x-api-url': apiUrl,
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch collection')
      }
      
      const data = await response.json()
      return data.data
    },
    enabled: !!apiKey && !!collectionId,
  })
}