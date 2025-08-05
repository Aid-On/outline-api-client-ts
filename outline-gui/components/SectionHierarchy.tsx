'use client'

import React from 'react'
import { ChevronRight, ChevronDown, Hash } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface Section {
  id: string
  level: number
  title: string
  children: Section[]
}

interface SectionHierarchyProps {
  sections: Section[]
  collapsedSections: Set<string>
  onSectionClick: (sectionId: string) => void
  onSectionToggle?: (sectionId: string) => void
  currentSectionId?: string
}

function SectionItem({ 
  section, 
  depth = 0,
  collapsedSections,
  onSectionClick,
  onSectionToggle,
  currentSectionId,
  darkMode
}: {
  section: Section
  depth: number
  collapsedSections: Set<string>
  onSectionClick: (sectionId: string) => void
  onSectionToggle?: (sectionId: string) => void
  currentSectionId?: string
  darkMode: boolean
}) {
  const hasChildren = section.children.length > 0
  const isCollapsed = collapsedSections.has(section.id)
  const isActive = currentSectionId === section.id
  
  return (
    <div className={`${depth > 0 ? 'ml-4' : ''}`}>
      <div className="flex items-center">
        {hasChildren && onSectionToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSectionToggle(section.id)
            }}
            className={`p-1 rounded mr-1 ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            } transition-colors`}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        )}
        {(!hasChildren || !onSectionToggle) && <div className="w-5 mr-1" />}
        
        <button 
          onClick={() => onSectionClick(section.id)}
          className={`flex-1 flex items-center p-2 rounded-lg text-left ${
            isActive 
              ? darkMode 
                ? 'bg-blue-900 text-blue-200' 
                : 'bg-blue-100 text-blue-900'
              : darkMode 
                ? 'hover:bg-gray-700 text-gray-100' 
                : 'hover:bg-gray-100 text-gray-900'
          } transition-colors`}
        >
        
        <Hash className={`h-3 w-3 mr-1 ${
          darkMode ? 'text-gray-500' : 'text-gray-400'
        } ${section.level === 1 ? 'opacity-100' : section.level === 2 ? 'opacity-75' : 'opacity-50'}`} />
        
          <span className={`break-words text-sm ${
            section.level === 1 ? 'font-semibold' : 
            section.level === 2 ? 'font-medium' : 
            'font-normal'
          }`}>
            {section.title}
          </span>
        </button>
      </div>

      {hasChildren && !isCollapsed && (
        <div className="mt-1">
          {section.children.map(child => (
            <SectionItem
              key={child.id}
              section={child}
              depth={depth + 1}
              collapsedSections={collapsedSections}
              onSectionClick={onSectionClick}
              onSectionToggle={onSectionToggle}
              currentSectionId={currentSectionId}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SectionHierarchy({ 
  sections, 
  collapsedSections,
  onSectionClick,
  onSectionToggle,
  currentSectionId
}: SectionHierarchyProps) {
  const { darkMode } = useTheme()
  
  return (
    <div className="space-y-1">
      {sections.map(section => (
        <SectionItem
          key={section.id}
          section={section}
          depth={0}
          collapsedSections={collapsedSections}
          onSectionClick={onSectionClick}
          onSectionToggle={onSectionToggle}
          currentSectionId={currentSectionId}
          darkMode={darkMode}
        />
      ))}
    </div>
  )
}