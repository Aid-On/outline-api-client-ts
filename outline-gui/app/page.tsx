'use client'

import { useState, useEffect } from 'react'
import { Settings, Search, Folder, FileText } from 'lucide-react'
import SettingsModal from '../components/SettingsModal'
import Link from 'next/link'

export default function Home() {
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiUrl, setApiUrl] = useState('https://app.getoutline.com')
  const [collections, setCollections] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('outline-api-key')
    const savedApiUrl = localStorage.getItem('outline-api-url')
    
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedApiUrl) setApiUrl(savedApiUrl)
  }, [])

  // Fetch collections when API key is available
  useEffect(() => {
    if (apiKey) {
      fetchCollections()
    }
  }, [apiKey, apiUrl])

  const handleSaveSettings = (newApiKey: string, newApiUrl: string) => {
    setApiKey(newApiKey)
    setApiUrl(newApiUrl)
    
    // Save to localStorage
    localStorage.setItem('outline-api-key', newApiKey)
    localStorage.setItem('outline-api-url', newApiUrl)
  }

  const fetchCollections = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/collections?action=list&includePrivate=true`, {
        headers: {
          'x-api-key': apiKey,
          'x-api-url': apiUrl,
        },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch collections')
      setCollections(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/documents?action=search&query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'x-api-key': apiKey,
          'x-api-url': apiUrl,
        },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Search failed')
      setSearchResults(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Outline API GUI</h1>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!apiKey ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Please configure your API key in the settings (click the gear icon in the top right).
            </p>
          </div>
        ) : (
          <>
            {/* Document Search */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Document Search
              </h2>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Search
                </button>
              </form>
              
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map((result: any) => {
                    const doc = result.document || result
                    return (
                      <Link
                        key={doc.id}
                        href={`/document/${doc.id}`}
                        className="block p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">{doc.title}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Collections */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Collections</h2>
              {loading && !searchQuery ? (
                <p className="text-gray-500">Loading collections...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : collections.length === 0 ? (
                <p className="text-gray-500">No collections found</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/collection/${collection.id}`}
                      className="block p-4 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center mr-3"
                          style={{ backgroundColor: collection.color || '#6366f1' }}
                        >
                          {collection.icon ? (
                            <span className="text-white text-sm">{collection.icon}</span>
                          ) : (
                            <Folder className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900">{collection.name}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Settings Modal */}
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