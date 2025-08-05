'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import MarkdownPreview from '@uiw/react-markdown-preview'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { Settings, ArrowLeft, Download, Clock, User, Moon, Sun, RefreshCw, FolderTree, List, FileText, Maximize2, Minimize2, Copy, Check, MoreVertical, Loader } from 'lucide-react'
import SettingsModal from '../../../components/SettingsModal'
import { useDocument } from '../../../hooks/useOutlineAPI'
import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from '../../../contexts/ThemeContext'
import { useDocumentChildren } from '../../../hooks/useDocumentChildren'
import DocumentHierarchy from '../../../components/DocumentHierarchy'
import MarkdownSectionView from '../../../components/MarkdownSectionView'
import SectionHierarchy from '../../../components/SectionHierarchy'

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
  const [showHierarchy, setShowHierarchy] = useState(true)
  const [showSectionView, setShowSectionView] = useState(false)
  const [showDocumentTree, setShowDocumentTree] = useState(false)
  const [allSectionsExpanded, setAllSectionsExpanded] = useState(true)
  const [sections, setSections] = useState<any[]>([])
  const [showMenu, setShowMenu] = useState(false)
  
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [copiedDocument, setCopiedDocument] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiUrl, setApiUrl] = useState('https://app.getoutline.com')
  const { darkMode, toggleDarkMode } = useTheme()
  
  // React Queryフックを使用
  const { data: document, isLoading: loading, error, refetch } = useDocument(id, { apiKey, apiUrl })

  // Load settings from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('outline-api-key')
    const savedApiUrl = localStorage.getItem('outline-api-url')
    
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedApiUrl) setApiUrl(savedApiUrl)
  }, [])
  
  // Parse sections when document changes
  useEffect(() => {
    if (document?.text) {
      // Parse sections manually here to avoid rendering hidden component
      const lines = document.text.split('\n')
      const flatSections: any[] = []
      let currentSection: any = null
      let contentLines: string[] = []
      let contentOnlyLines: string[] = []
      let inCodeBlock = false
      let codeBlockDelimiter = ''

      lines.forEach((line: string, index: number) => {
        // Check for code block boundaries
        const codeBlockMatch = line.match(/^(```|~~~)/)
        if (codeBlockMatch) {
          if (!inCodeBlock) {
            inCodeBlock = true
            codeBlockDelimiter = codeBlockMatch[1]
          } else if (line.startsWith(codeBlockDelimiter)) {
            inCodeBlock = false
            codeBlockDelimiter = ''
          }
        }
        
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
        
        // Only treat as heading if not inside a code block
        if (headingMatch && !inCodeBlock) {
          if (currentSection) {
            currentSection.content = contentLines.join('\n').trim()
            currentSection.contentOnly = contentOnlyLines.join('\n').trim()
            flatSections.push(currentSection)
          }
          
          const level = headingMatch[1].length
          const title = headingMatch[2]
          currentSection = {
            id: `section-${index}`,
            level,
            title,
            content: '',
            contentOnly: '',
            children: []
          }
          contentLines = [line]
          contentOnlyLines = []
        } else {
          contentLines.push(line)
          contentOnlyLines.push(line)
        }
      })

      if (currentSection) {
        currentSection.content = contentLines.join('\n').trim()
        currentSection.contentOnly = contentOnlyLines.join('\n').trim()
        flatSections.push(currentSection)
      }

      // Build hierarchy
      const rootSections: any[] = []
      const stack: any[] = []

      flatSections.forEach(section => {
        while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
          stack.pop()
        }

        if (stack.length === 0) {
          rootSections.push(section)
        } else {
          const parent = stack[stack.length - 1]
          parent.children.push(section)
          section.parent = parent
        }

        stack.push(section)
      })

      setSections(rootSections)
    }
  }, [document?.text])

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
  
  const handleCopyDocument = async () => {
    if (!document) return
    
    try {
      await navigator.clipboard.writeText(document.text || '')
      setCopiedDocument(true)
      setTimeout(() => setCopiedDocument(false), 2000)
    } catch (err) {
      console.error('Failed to copy document:', err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }
  
  // Helper function to find a section by ID recursively
  const findSectionById = (sections: any[], sectionId: string): any => {
    for (const section of sections) {
      if (section.id === sectionId) return section
      if (section.children && section.children.length > 0) {
        const found = findSectionById(section.children, sectionId)
        if (found) return found
      }
    }
    return null
  }
  
  const handleSectionClick = (sectionId: string) => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (showSectionView) {
        // In section view, scroll to the section element
        const element = window.document.getElementById(sectionId)
        if (element) {
          const scrollContainer = window.document.getElementById('content-area')
          if (scrollContainer && showHierarchy) {
            // When hierarchy is shown, content area has its own scroll
            const offset = element.offsetTop - 20
            scrollContainer.scrollTo({ top: offset, behavior: 'smooth' })
          } else {
            // When hierarchy is hidden, use the main scroll
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      } else {
        // In normal view, find the heading by matching the section
        const targetSection = findSectionById(sections, sectionId)
        if (targetSection) {
          // Find all headings in the content area
          const contentArea = window.document.getElementById('content-area')
          const headings = contentArea ? contentArea.querySelectorAll('h1, h2, h3, h4, h5, h6') : window.document.querySelectorAll('h1, h2, h3, h4, h5, h6')
          
          for (const heading of headings) {
            if (heading.textContent?.trim() === targetSection.title.trim()) {
              const scrollContainer = window.document.getElementById('content-area')
              if (scrollContainer && showHierarchy) {
                const offset = heading.offsetTop - 20
                scrollContainer.scrollTo({ top: offset, behavior: 'smooth' })
              } else {
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              break
            }
          }
        }
      }
    })
  }
  
  const handleSectionToggle = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }
  
  // Handle expand/collapse all
  const handleExpandCollapseAll = (expandAll: boolean) => {
    if (expandAll) {
      // Clear all collapsed sections
      setCollapsedSections(new Set())
    } else {
      // Collapse all sections
      const allSectionIds = new Set<string>()
      const collectIds = (sectionList: any[]) => {
        sectionList.forEach(section => {
          allSectionIds.add(section.id)
          if (section.children && section.children.length > 0) {
            collectIds(section.children)
          }
        })
      }
      collectIds(sections)
      setCollapsedSections(allSectionIds)
    }
    // Update the button state
    setAllSectionsExpanded(expandAll)
  }

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Navigation Bar */}
      <header className={`flex-shrink-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
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
            </div>
            <div className="flex items-center space-x-2">
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
      <main className={`flex-1 ${showHierarchy ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <div className={`h-full ${showHierarchy ? 'flex' : ''}`}>
          {!apiKey ? (
            <div className={`flex items-center justify-center ${showHierarchy ? 'h-full w-full' : 'min-h-[400px] max-w-4xl mx-auto p-8'}`}>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Please configure your API key in the settings.
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className={`flex items-center justify-center ${showHierarchy ? 'h-full w-full' : 'min-h-[400px]'}`}>
              <div className="flex flex-col items-center space-y-4">
                <Loader className={`h-8 w-8 animate-spin ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading document...</p>
              </div>
            </div>
          ) : error ? (
            <div className={`flex items-center justify-center ${showHierarchy ? 'h-full w-full' : 'min-h-[400px] max-w-4xl mx-auto p-8'}`}>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 ${showHierarchy ? '' : 'w-full'}`}>
                <p className="text-red-600">{error.message}</p>
              </div>
            </div>
          ) : document ? (
            <>
              {/* Sidebar */}
              {showHierarchy && (
                <aside className={`w-80 flex-shrink-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
                  <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                    <div className="flex items-center justify-between">
                      <h2 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        Table of Contents
                      </h2>
                      <button
                        onClick={() => setShowDocumentTree(!showDocumentTree)}
                        className={`text-xs px-2 py-1 rounded ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        } transition-colors`}
                      >
                        {showDocumentTree ? 'Sections' : 'Document Tree'}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {!showDocumentTree ? (
                      sections.length > 0 ? (
                        <SectionHierarchy
                          sections={sections}
                          collapsedSections={collapsedSections}
                          onSectionClick={handleSectionClick}
                          onSectionToggle={showSectionView ? handleSectionToggle : undefined}
                        />
                      ) : (
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          No sections found in document
                        </div>
                      )
                    ) : (
                      <DocumentHierarchy
                        documentId={document.id}
                        title={document.title}
                        apiKey={apiKey}
                        apiUrl={apiUrl}
                      />
                    )}
                  </div>
                </aside>
              )}
              {/* Content Area */}
              <div className={`${showHierarchy ? 'flex-1 overflow-hidden flex flex-col' : `max-w-4xl mx-auto my-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}`}>
                {/* Title Bar */}
                <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h1 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'} break-words`}>
                        {document.title}
                      </h1>
                      <div className={`flex items-center space-x-4 text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
                    
                    {/* Popup Menu */}
                    <div className="relative ml-4">
                      <button
                        onClick={() => setShowMenu(!showMenu)}
                        className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                        title="More options"
                      >
                        <MoreVertical className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                      </button>
                      
                      {showMenu && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowMenu(false)}
                          />
                          <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-20`}>
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setShowHierarchy(!showHierarchy)
                                  setShowMenu(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center space-x-2`}
                              >
                                <FolderTree className="h-4 w-4" />
                                <span>{showHierarchy ? "Hide Sidebar" : "Show Sidebar"}</span>
                              </button>
                              
                              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                              
                              <button
                                onClick={() => {
                                  setShowSectionView(!showSectionView)
                                  setShowMenu(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center space-x-2`}
                              >
                                {showSectionView ? (
                                  <FileText className="h-4 w-4" />
                                ) : (
                                  <List className="h-4 w-4" />
                                )}
                                <span>{showSectionView ? "Text View" : "Block View"}</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  handleCopyDocument()
                                  setShowMenu(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center space-x-2`}
                              >
                                <Copy className="h-4 w-4" />
                                <span>Copy Document</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  handleExport()
                                  setShowMenu(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex items-center space-x-2`}
                              >
                                <Download className="h-4 w-4" />
                                <span>Export as Markdown</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
            
                <div id="content-area" className={`${showHierarchy ? 'flex-1 overflow-y-auto' : ''} px-6 py-6`}>
              {showSectionView ? (
                <>
                  <div className={`flex justify-end mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <button
                      onClick={() => handleExpandCollapseAll(!allSectionsExpanded)}
                      className={`flex items-center space-x-2 px-3 py-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                      title={allSectionsExpanded ? "Collapse all sections" : "Expand all sections"}
                    >
                      {allSectionsExpanded ? (
                        <>
                          <Minimize2 className="h-4 w-4" />
                          <span className="text-sm">Collapse All</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-4 w-4" />
                          <span className="text-sm">Expand All</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : null}
              
              {showSectionView ? (
                <MarkdownSectionView
                  source={document.text || ''}
                  darkMode={darkMode}
                  defaultExpanded={allSectionsExpanded}
                  onSectionToggle={handleSectionToggle}
                  externalCollapsedSections={collapsedSections}
                />
              ) : (
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
              )}
                </div>
              </div>
            </>
          ) : null}
        </div>
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