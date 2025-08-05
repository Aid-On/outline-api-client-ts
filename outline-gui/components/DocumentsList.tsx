'use client'

import { useState, useEffect } from 'react'
import { FileText, Clock, ChevronRight } from 'lucide-react'

interface Document {
  id: string
  title: string
  text?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  archivedAt?: string
  deletedAt?: string
}

interface DocumentsListProps {
  apiKey: string
  apiUrl: string
  collectionId: string
  onSelectDocument: (document: Document) => void
}

export default function DocumentsList({ apiKey, apiUrl, collectionId, onSelectDocument }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [apiKey, apiUrl, collectionId])

  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        action: 'list',
        collectionId,
        limit: '50',
        sort: 'updatedAt',
      })
      const response = await fetch(`/api/documents?${params}`, {
        headers: {
          'x-api-key': apiKey,
          'x-api-url': apiUrl,
        },
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documents')
      }

      setDocuments(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading documents...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">{error}</div>
        <button
          onClick={fetchDocuments}
          className="text-indigo-600 hover:text-indigo-500"
        >
          Try again
        </button>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No documents found in this collection
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((document) => (
        <button
          key={document.id}
          onClick={() => onSelectDocument(document)}
          className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{document.title}</h3>
                {document.text && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {document.text.replace(/[#*`]/g, '').trim()}
                  </p>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>Updated {formatDate(document.updatedAt)}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
          </div>
        </button>
      ))}
    </div>
  )
}