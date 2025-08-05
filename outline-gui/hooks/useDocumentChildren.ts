import { useQuery } from '@tanstack/react-query'

interface UseDocumentChildrenOptions {
  apiKey: string
  apiUrl: string
}

export function useDocumentChildren(parentDocumentId: string | null, { apiKey, apiUrl }: UseDocumentChildrenOptions) {
  return useQuery({
    queryKey: ['documents', 'children', parentDocumentId, apiKey, apiUrl],
    queryFn: async () => {
      if (!apiKey || !parentDocumentId) return []
      
      let allDocuments: any[] = []
      let offset = 0
      const limit = 25 // Outline API の最大値
      let hasMore = true
      
      while (hasMore) {
        const response = await fetch(`/api/documents?action=list&parentDocumentId=${encodeURIComponent(parentDocumentId)}&offset=${offset}&limit=${limit}`, {
          headers: {
            'x-api-key': apiKey,
            'x-api-url': apiUrl,
          },
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to fetch child documents')
        }
        
        const data = await response.json()
        const documents = data.data || []
        allDocuments = [...allDocuments, ...documents]
        
        // 取得したドキュメント数がlimit未満の場合、次のページはない
        hasMore = documents.length === limit
        offset += limit
      }
      
      return allDocuments
    },
    enabled: !!apiKey && !!parentDocumentId,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  })
}