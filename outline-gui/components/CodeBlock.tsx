'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  darkMode?: boolean
}

export default function CodeBlock({ children, className, darkMode = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  
  // Extract language from className
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : 'auto'
  
  const handleCopy = () => {
    const code = typeof children === 'string' ? children : ''
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="relative group">
      {/* Language label */}
      <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-mono ${
        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
      } rounded-bl`}>
        {language}
      </div>
      
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={`absolute top-0 right-12 px-2 py-1 text-xs ${
          darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        } rounded-bl opacity-0 group-hover:opacity-100 transition-opacity`}
        title="Copy code"
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
      
      <code className={className}>
        {children}
      </code>
    </div>
  )
}