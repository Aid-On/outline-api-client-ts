'use client'

import { useState, useEffect } from 'react'
import { Folder, Lock, ChevronRight } from 'lucide-react'

interface Collection {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  private?: boolean
  createdAt: string
  updatedAt: string
}

interface CollectionsListProps {
  apiKey: string
  apiUrl: string
  onSelectCollection: (collection: Collection) => void
}

export default function CollectionsList({ apiKey, apiUrl, onSelectCollection }: CollectionsListProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCollections()
  }, [apiKey, apiUrl])

  const fetchCollections = async () => {
    if (!apiKey) {
      setError('API key is required')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ action: 'list', includePrivate: 'true' })
      const response = await fetch(`/api/collections?${params}`, {
        headers: {
          'x-api-key': apiKey,
          'x-api-url': apiUrl,
        },
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch collections')
      }

      setCollections(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading collections...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">{error}</div>
        <button
          onClick={fetchCollections}
          className="text-indigo-600 hover:text-indigo-500"
        >
          Try again
        </button>
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No collections found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {collections.map((collection) => (
        <button
          key={collection.id}
          onClick={() => onSelectCollection(collection)}
          className="p-5 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md transition-all group text-left"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: collection.color || '#6366f1' }}
            >
              {collection.icon ? (
                <span className="text-white text-2xl">{collection.icon}</span>
              ) : (
                <Folder className="w-8 h-8 text-white" />
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 flex items-center justify-center">
                {collection.name}
                {collection.private && (
                  <Lock className="w-3 h-3 ml-2 text-gray-500" />
                )}
              </h3>
              <p className="text-xs text-gray-500">
                {new Date(collection.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}