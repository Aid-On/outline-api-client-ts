'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Settings, ArrowLeft, FileText, Clock, RefreshCw, Moon, Sun, ChevronRight } from 'lucide-react'
import SettingsModal from '../../../components/SettingsModal'
import Link from 'next/link'
import { useCollectionInfo, useCollectionDocuments } from '../../../hooks/useOutlineAPI'
import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from '../../../contexts/ThemeContext'
import DocumentHierarchy from '../../../components/DocumentHierarchy'
import ReactMarkdown from 'react-markdown'

export default function CollectionPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const { darkMode, toggleDarkMode } = useTheme()
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
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Back to collections"
              >
                <ArrowLeft className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'} break-words`}>
                {collection?.name || 'Loading...'}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Refresh"
                disabled={collectionLoading || documentsLoading}
              >
                <RefreshCw className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'} ${collectionLoading || documentsLoading ? 'animate-spin' : ''}`} />
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
              Please configure your API key in the settings.
            </p>
          </div>
        ) : (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            {collection?.description && (
              <div className={`mb-8 p-6 rounded-lg ${darkMode ? 'bg-gray-900/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} prose ${darkMode ? 'prose-invert' : 'prose-gray'} max-w-none
                  ${darkMode ? '[&>*]:text-gray-300 [&_p]:text-gray-300 [&_li]:text-gray-300 [&_td]:text-gray-300' : ''}
                  prose-headings:font-semibold
                  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                  ${darkMode ? '[&_h1]:text-gray-100 [&_h2]:text-gray-200 [&_h3]:text-gray-300 [&_h4]:text-gray-300' : ''}
                  prose-p:leading-7 prose-p:my-4
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  ${darkMode ? '[&_a]:text-blue-400 hover:[&_a]:text-blue-300' : ''}
                  prose-strong:font-semibold
                  ${darkMode ? '[&_strong]:text-gray-200' : ''}
                  prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
                  ${darkMode ? '[&_code]:bg-gray-800 [&_code]:text-gray-300' : 'prose-code:bg-gray-100 prose-code:text-gray-800'}
                  prose-pre:rounded-lg prose-pre:shadow-sm
                  ${darkMode ? '[&_pre]:bg-gray-800 [&_pre]:border [&_pre]:border-gray-700 [&_pre_code]:text-gray-300' : 'prose-pre:bg-gray-900'}
                  prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic
                  ${darkMode ? '[&_blockquote]:border-gray-600 [&_blockquote]:text-gray-300' : 'prose-blockquote:border-gray-300'}
                  prose-ul:list-disc prose-ol:list-decimal prose-li:my-2
                  ${darkMode ? '[&_ul]:text-gray-300 [&_ol]:text-gray-300' : ''}
                  prose-li:marker:text-gray-500
                  ${darkMode ? '[&_li::marker]:text-gray-400' : ''}
                  [&_hr]:my-8 [&_hr]:border-t [&_hr]:border-gray-300
                  ${darkMode ? '[&_hr]:border-gray-600' : ''}
                  prose-table:border-collapse prose-th:border prose-td:border
                  ${darkMode ? '[&_th]:border-gray-600 [&_td]:border-gray-600 [&_th]:text-gray-200 [&_td]:text-gray-300' : 'prose-th:border-gray-300 prose-td:border-gray-300'}
                  prose-img:rounded-lg prose-img:shadow-md`}>
                  <ReactMarkdown>{collection.description}</ReactMarkdown>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Documents</h2>
              {documents.length > 0 && (
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {documents.length} documents (cached)
                </span>
              )}
            </div>
            
            {documentsLoading ? (
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading documents...</p>
            ) : error ? (
              <p className="text-red-600">{error.message}</p>
            ) : documents.length === 0 ? (
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No documents found in this collection</p>
            ) : (
              <div className="space-y-2">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className={`border rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <DocumentHierarchy
                      documentId={document.id}
                      title={document.title}
                      apiKey={apiKey}
                      apiUrl={apiUrl}
                    />
                  </div>
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