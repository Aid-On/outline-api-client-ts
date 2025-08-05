'use client'

import { useState, useEffect } from 'react'
import { Settings, Search, Folder, FileText, RefreshCw, Moon, Sun } from 'lucide-react'
import SettingsModal from '../components/SettingsModal'
import Link from 'next/link'
import { useCollections, useDocumentSearch } from '../hooks/useOutlineAPI'
import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from '../contexts/ThemeContext'

export default function Home() {
  const queryClient = useQueryClient()
  const { darkMode, toggleDarkMode } = useTheme()
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiUrl, setApiUrl] = useState('https://app.getoutline.com')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('outline-api-key')
    const savedApiUrl = localStorage.getItem('outline-api-url')
    
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedApiUrl) setApiUrl(savedApiUrl)
  }, [])

  // React Queryフックを使用
  const { data: collections = [], isLoading: collectionsLoading, error: collectionsError, refetch: refetchCollections } = useCollections({ apiKey, apiUrl })
  const { data: searchResults = [], isLoading: searchLoading } = useDocumentSearch(searchQuery, { apiKey, apiUrl })

  const handleSaveSettings = (newApiKey: string, newApiUrl: string) => {
    setApiKey(newApiKey)
    setApiUrl(newApiUrl)
    
    // Save to localStorage
    localStorage.setItem('outline-api-key', newApiKey)
    localStorage.setItem('outline-api-url', newApiUrl)
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['collections'] })
    refetchCollections()
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    setSearchQuery(searchInput)
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Outline API GUI</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Refresh"
                disabled={collectionsLoading}
              >
                <RefreshCw className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'} ${collectionsLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Toggle Dark Mode"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-gray-300" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Settings"
              >
                <Settings className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
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
              Please configure your API key in the settings (click the gear icon in the top right).
            </p>
          </div>
        ) : (
          <>
            {/* Document Search */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 mb-6`}>
              <h2 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                <Search className="h-5 w-5 mr-2" />
                Document Search
              </h2>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search documents..."
                  className={`flex-1 px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
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
                        className={`block p-3 border rounded-lg ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-start">
                          <FileText className={`h-4 w-4 mr-2 flex-shrink-0 mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`font-medium ${darkMode ? 'text-gray-100' : ''} break-words`}>{doc.title}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Collections */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Collections</h2>
                {collections.length > 0 && (
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {collections.length} collections (cached)
                  </span>
                )}
              </div>
              {collectionsLoading ? (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading collections...</p>
              ) : collectionsError ? (
                <p className="text-red-600">{collectionsError.message}</p>
              ) : collections.length === 0 ? (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No collections found</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/collection/${collection.id}`}
                      className={`block p-4 border rounded-lg ${darkMode ? 'border-gray-700 hover:border-indigo-500 hover:bg-gray-700' : 'hover:border-indigo-500 hover:bg-indigo-50'} transition-colors`}
                    >
                      <div className="flex items-start">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center mr-3 flex-shrink-0"
                          style={{ backgroundColor: collection.color || '#6366f1' }}
                        >
                          {collection.icon && collection.icon.length <= 2 ? (
                            <span className="text-white text-sm">{collection.icon}</span>
                          ) : (
                            <Folder className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <h3 className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'} break-words`}>{collection.name}</h3>
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