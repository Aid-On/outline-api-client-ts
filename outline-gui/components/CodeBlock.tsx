'use client'

import { useState, useMemo } from 'react'
import { Copy, Check, ChevronDown, ChevronRight, Code } from 'lucide-react'

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  darkMode?: boolean
}

export default function CodeBlock({ children, className, darkMode = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Extract language from className
  const language = useMemo(() => {
    const match = /language-(\w+)/.exec(className || '')
    return match ? match[1] : 'code'
  }, [className])
  
  // Get code content from children - for copying
  const codeContent = useMemo(() => {
    // Helper function to extract text from React elements
    const extractText = (node: any): string => {
      if (node === null || node === undefined) {
        return ''
      }
      
      if (typeof node === 'string') {
        return node
      }
      
      if (typeof node === 'number') {
        return String(node)
      }
      
      if (Array.isArray(node)) {
        return node.map(extractText).join('')
      }
      
      if (node && typeof node === 'object') {
        // Check for React elements with type and props
        if (node.type && node.props) {
          return extractText(node.props.children)
        }
        // Check for plain objects with props
        if (node.props && node.props.children !== undefined) {
          return extractText(node.props.children)
        }
        // Check for _owner property (React internal)
        if (node._owner && node._store) {
          // This is likely a React element
          if (node.props && node.props.children !== undefined) {
            return extractText(node.props.children)
          }
        }
      }
      
      return ''
    }
    
    return extractText(children)
  }, [children])
  
  const lineCount = codeContent.split('\n').length
  const shouldShowToggle = lineCount > 5 // Show toggle for code blocks with more than 5 lines
  
  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }
  
  return (
    <div className={`relative group border ${darkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg overflow-hidden my-2`}>
      {/* Header */}
      <div className={`flex items-center ${
        darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-100 border-b border-gray-300'
      }`}>
        {/* Clickable header area - always clickable if toggle is available */}
        <button
          onClick={shouldShowToggle ? toggleCollapse : undefined}
          className={`flex-1 flex items-center space-x-2 px-3 py-2 text-left ${
            shouldShowToggle ? 'cursor-pointer' : 'cursor-default'
          } ${
            shouldShowToggle && darkMode ? 'hover:bg-gray-700' : ''
          } ${
            shouldShowToggle && !darkMode ? 'hover:bg-gray-200' : ''
          } transition-colors`}
          type="button"
        >
          {shouldShowToggle && (
            <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          )}
          <Code className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          <span className={`text-sm font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {language}
          </span>
          {lineCount > 1 && (
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {lineCount} lines
            </span>
          )}
        </button>
        
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`px-3 py-2 text-xs flex items-center space-x-1 ${
            darkMode ? 'hover:bg-gray-700 text-gray-300 border-l border-gray-700' : 'hover:bg-gray-200 text-gray-700 border-l border-gray-300'
          } transition-colors`}
          title="Copy code"
          type="button"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code content */}
      <div className={`relative ${isCollapsed ? 'max-h-32 overflow-hidden' : ''}`}>
        <pre className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 overflow-x-auto`}>
          <code className={className}>
            {children}
          </code>
        </pre>
        {isCollapsed && (
          <div className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t ${
            darkMode ? 'from-gray-900 to-transparent' : 'from-gray-50 to-transparent'
          } pointer-events-none`} />
        )}
      </div>
    </div>
  )
}