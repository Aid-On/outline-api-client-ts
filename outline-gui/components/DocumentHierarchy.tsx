'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown, FileText } from 'lucide-react'
import { useDocumentChildren } from '../hooks/useDocumentChildren'
import { useTheme } from '../contexts/ThemeContext'

interface DocumentHierarchyProps {
  documentId: string
  title: string
  level?: number
  apiKey: string
  apiUrl: string
  parentDocumentId?: string | null
}

export default function DocumentHierarchy({ 
  documentId, 
  title, 
  level = 0, 
  apiKey, 
  apiUrl,
  parentDocumentId = null
}: DocumentHierarchyProps) {
  const { darkMode } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 子ドキュメントを取得
  const { data: children = [], isLoading, error } = useDocumentChildren(
    documentId, 
    { apiKey, apiUrl }
  )

  const hasChildren = children.length > 0

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={`${level > 0 ? 'ml-6' : ''}`}>
      <Link 
        href={`/document/${documentId}`}
        className={`flex items-start p-2 rounded-lg ${
          darkMode 
            ? 'hover:bg-gray-700 text-gray-100' 
            : 'hover:bg-gray-100 text-gray-900'
        } transition-colors`}
      >
        {isLoading ? (
          <div className="w-6 mr-1 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : hasChildren ? (
          <button
            onClick={handleToggle}
            className={`p-1 rounded mr-1 flex-shrink-0 ${
              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
            } transition-colors`}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-6 mr-1" />
        )}
        <FileText className={`h-4 w-4 mr-2 flex-shrink-0 mt-1 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <span className="break-words">{title}</span>
      </Link>

      {isExpanded && hasChildren && (
        <div className="mt-1">
          {children.map((child: any) => (
            <DocumentHierarchy
              key={child.id}
              documentId={child.id}
              title={child.title}
              level={level + 1}
              apiKey={apiKey}
              apiUrl={apiUrl}
              parentDocumentId={documentId}
            />
          ))}
        </div>
      )}
    </div>
  )
}