'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Edit, Trash2, Download } from 'lucide-react'

interface Document {
  id: string
  title: string
  text?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

interface DocumentViewProps {
  apiKey: string
  apiUrl: string
  documentId: string
  onBack: () => void
}

export default function DocumentView({ apiKey, apiUrl, documentId, onBack }: DocumentViewProps) {
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDocument()
  }, [apiKey, apiUrl, documentId])

  const fetchDocument = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        action: 'info',
        id: documentId,
      })
      const response = await fetch(`/api/documents?${params}`, {
        headers: {
          'x-api-key': apiKey,
          'x-api-url': apiUrl,
        },
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch document')
      }

      setDocument(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        action: 'export',
        id: documentId,
        format: 'markdown',
      })
      const response = await fetch(`/api/documents?${params}`, {
        headers: {
          'x-api-key': apiKey,
          'x-api-url': apiUrl,
        },
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to export document')
      }

      // Create download
      const blob = new Blob([data.data || data], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${document?.title || 'document'}.md`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(`Export failed: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading document...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">{error}</div>
        <button
          onClick={fetchDocument}
          className="text-indigo-600 hover:text-indigo-500"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="text-center py-8 text-gray-500">
        Document not found
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="Back to documents"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">{document.title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="Export as Markdown"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Updated: {new Date(document.updatedAt).toLocaleString()}
        </div>
      </div>
      
      <div className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-300px)]">
        <div className="prose prose-lg max-w-4xl mx-auto
          prose-headings:font-semibold prose-headings:text-gray-900
          prose-p:text-gray-700 prose-p:leading-relaxed
          prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 prose-strong:font-semibold
          prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200
          prose-blockquote:border-l-4 prose-blockquote:border-indigo-400 prose-blockquote:pl-4 prose-blockquote:italic
          prose-img:rounded-lg prose-img:shadow-md
          prose-hr:border-gray-300
          prose-ul:list-disc prose-ol:list-decimal
          prose-li:text-gray-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {document.text || ''}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}