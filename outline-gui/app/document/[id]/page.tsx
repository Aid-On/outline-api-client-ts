'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Settings, ArrowLeft, Download, Clock, User } from 'lucide-react'
import SettingsModal from '../../../components/SettingsModal'

export default function DocumentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiUrl, setApiUrl] = useState('https://app.getoutline.com')
  const [document, setDocument] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load settings from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('outline-api-key')
    const savedApiUrl = localStorage.getItem('outline-api-url')
    
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedApiUrl) setApiUrl(savedApiUrl)
  }, [])

  // Fetch document
  useEffect(() => {
    if (apiKey && id) {
      fetchDocument()
    }
  }, [apiKey, apiUrl, id])

  const fetchDocument = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/documents?action=info&id=${id}`, {
        headers: {
          'x-api-key': apiKey,
          'x-api-url': apiUrl,
        },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch document')
      setDocument(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = (newApiKey: string, newApiUrl: string) => {
    setApiKey(newApiKey)
    setApiUrl(newApiUrl)
    localStorage.setItem('outline-api-key', newApiKey)
    localStorage.setItem('outline-api-url', newApiUrl)
  }

  const handleExport = () => {
    if (!document) return
    
    const blob = new Blob([document.text || ''], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${document.title || 'document'}.md`
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {document?.title || 'Loading...'}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {document && (
                <button
                  onClick={handleExport}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Export as Markdown"
                >
                  <Download className="h-5 w-5 text-gray-600" />
                </button>
              )}
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!apiKey ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Please configure your API key in the settings.
            </p>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Loading document...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-red-600">{error}</p>
          </div>
        ) : document ? (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {document.createdBy && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{document.createdBy.name}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Updated {formatDate(document.updatedAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-6">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {document.text || ''}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : null}
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