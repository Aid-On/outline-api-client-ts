'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import MarkdownPreview from '@uiw/react-markdown-preview'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { Settings, ArrowLeft, Download, Clock, User, Moon, Sun, RefreshCw } from 'lucide-react'
import SettingsModal from '../../../components/SettingsModal'
import { useDocument } from '../../../hooks/useOutlineAPI'
import { useQueryClient } from '@tanstack/react-query'

const MermaidDiagram = dynamic(() => import('../../../components/MermaidDiagram'), {
  ssr: false,
})
const CodeBlock = dynamic(() => import('../../../components/CodeBlock'), {
  ssr: false,
})
const CacheIndicator = dynamic(() => import('../../../components/CacheIndicator'), {
  ssr: false,
})

export default function DocumentPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const id = params?.id as string
  
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiUrl, setApiUrl] = useState('https://app.getoutline.com')
  const [darkMode, setDarkMode] = useState(false)
  
  // React Queryフックを使用
  const { data: document, isLoading: loading, error, refetch } = useDocument(id, { apiKey, apiUrl })

  // Load settings from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('outline-api-key')
    const savedApiUrl = localStorage.getItem('outline-api-url')
    const savedDarkMode = localStorage.getItem('outline-dark-mode')
    
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedApiUrl) setApiUrl(savedApiUrl)
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true')
  }, [])

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['documents', 'info', id] })
    refetch()
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

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('outline-dark-mode', String(newDarkMode))
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Back"
              >
                <ArrowLeft className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {document?.title || 'Loading...'}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {document && (
                <button
                  onClick={handleExport}
                  className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  title="Export as Markdown"
                >
                  <Download className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              )}
              <button
                onClick={handleRefresh}
                className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Refresh"
                disabled={loading}
              >
                <RefreshCw className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'} ${loading ? 'animate-spin' : ''}`} />
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!apiKey ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Please configure your API key in the settings.
            </p>
          </div>
        ) : loading ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading document...</p>
          </div>
        ) : error ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <p className="text-red-600">{error.message}</p>
          </div>
        ) : document ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`flex items-center space-x-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
                <CacheIndicator queryKey={['documents', 'info', id, apiKey, apiUrl]} />
              </div>
            </div>
            
            <div className="px-6 py-6">
              <MarkdownPreview
                source={document.text || ''}
                style={{ backgroundColor: 'transparent' }}
                wrapperElement={{
                  "data-color-mode": darkMode ? "dark" : "light"
                }}
                rehypePlugins={[
                  [rehypeHighlight, { 
                    detect: true,
                    subset: false, // すべての言語を含める
                    ignoreMissing: true, // 不明な言語でもエラーにしない
                    plainText: ['txt', 'text'] // プレーンテキストとして扱う拡張子
                  }],
                  rehypeRaw
                ]}
                components={{
                  pre: ({ children, ...props }) => {
                    // preタグに直接classNameがある場合はそれを使用
                    const preClassName = props.className || ''
                    const preMatch = /language-(mermaid|mermaidjs)/.exec(preClassName)
                    
                    if (preMatch) {
                      // childrenが配列の場合、その中からテキストを取得
                      let mermaidCode = ''
                      if (Array.isArray(children)) {
                        children.forEach(child => {
                          if (child && child.props && child.props.children) {
                            if (typeof child.props.children === 'string') {
                              mermaidCode += child.props.children
                            } else if (Array.isArray(child.props.children)) {
                              mermaidCode += child.props.children.filter(c => typeof c === 'string').join('')
                            }
                          }
                        })
                      }
                      
                      if (mermaidCode) {
                        console.log('Rendering Mermaid from pre (className on pre):', mermaidCode)
                        return <MermaidDiagram chart={mermaidCode} darkMode={darkMode} />
                      }
                    }
                    
                    return <pre {...props}>{children}</pre>
                  },
                  code: ({ children, className, ...props }) => {
                    const match = /language-(mermaid|mermaidjs)/.exec(className || '')
                    const isMermaid = !!match
                    const isInline = !className // インラインコードの判定
                    
                    // mermaidの場合（CodeBlockではなく直接処理）
                    if (isMermaid && !isInline) {
                      // childrenが配列の場合、文字列を抽出
                      let mermaidCode = ''
                      if (Array.isArray(children)) {
                        children.forEach(child => {
                          if (typeof child === 'string') {
                            mermaidCode += child
                          } else if (child && typeof child === 'object' && child.props) {
                            // Reactエレメントの場合
                            if (typeof child.props.children === 'string') {
                              mermaidCode += child.props.children
                            }
                          }
                        })
                      } else if (typeof children === 'string') {
                        mermaidCode = children
                      }
                      
                      if (mermaidCode) {
                        return <MermaidDiagram chart={mermaidCode} darkMode={darkMode} />
                      }
                    }
                    
                    // インラインコードの場合は通常のcodeタグを使用
                    if (isInline) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                    
                    // コードブロックの場合はCodeBlockコンポーネントを使用
                    return (
                      <CodeBlock className={className} darkMode={darkMode}>
                        {children}
                      </CodeBlock>
                    )
                  },
                }}
              />
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