'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Settings, ArrowLeft, FileText, Clock, RefreshCw } from 'lucide-react'
import SettingsModal from '../../../components/SettingsModal'
import Link from 'next/link'
import { useCollectionInfo, useCollectionDocuments } from '../../../hooks/useOutlineAPI'
import { useQueryClient } from '@tanstack/react-query'

export default function CollectionPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const id = params?.id as string
  
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiUrl, setApiUrl] = useState('https://app.getoutline.com')
  
  // React Queryフックを使用
  const { data: collection, isLoading: collectionLoading, refetch: refetchCollection } = useCollectionInfo(id, { apiKey, apiUrl })
  const { data: documents = [], isLoading: documentsLoading, error, refetch: refetchDocuments } = useCollectionDocuments(id, { apiKey, apiUrl })

  // Load settings from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('outline-api-key')
    const savedApiUrl = localStorage.getItem('outline-api-url')
    
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedApiUrl) setApiUrl(savedApiUrl)
  }, [])

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['collections', 'info', id] })
    queryClient.invalidateQueries({ queryKey: ['documents', 'list', id] })
    refetchCollection()
    refetchDocuments()
  }

  const handleSaveSettings = (newApiKey: string, newApiUrl: string) => {
    setApiKey(newApiKey)
    setApiUrl(newApiUrl)
    localStorage.setItem('outline-api-key', newApiKey)
    localStorage.setItem('outline-api-url', newApiUrl)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Back to collections"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {collection?.name || 'Loading...'}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Refresh"
                disabled={collectionLoading || documentsLoading}
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${collectionLoading || documentsLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!apiKey ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Please configure your API key in the settings.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            {collection?.description && (
              <p className="text-gray-600 mb-6">{collection.description}</p>
            )}
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Documents</h2>
              {documents.length > 0 && (
                <span className="text-sm text-gray-500">
                  {documents.length} documents (cached)
                </span>
              )}
            </div>
            
            {documentsLoading ? (
              <p className="text-gray-500">Loading documents...</p>
            ) : error ? (
              <p className="text-red-600">{error.message}</p>
            ) : documents.length === 0 ? (
              <p className="text-gray-500">No documents found in this collection</p>
            ) : (
              <div className="space-y-2">
                {documents.map((document) => (
                  <Link
                    key={document.id}
                    href={`/document/${document.id}`}
                    className="block p-4 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">{document.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>Updated {formatDate(document.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        currentApiKey={apiKey}
        currentApiUrl={apiUrl}
      />
    </div>
  )
}