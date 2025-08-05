'use client'

import { useState, useMemo, useCallback, memo, useEffect } from 'react'
import MarkdownPreview from '@uiw/react-markdown-preview'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { ChevronDown, ChevronRight, Copy, Check, FileText, FolderOpen } from 'lucide-react'
import dynamic from 'next/dynamic'

const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
})
const CodeBlock = dynamic(() => import('./CodeBlock'), {
  ssr: false,
})

interface MarkdownSection {
  id: string
  level: number
  title: string
  content: string
  contentOnly: string
  children: MarkdownSection[]
  parent?: MarkdownSection
}

interface MarkdownSectionViewProps {
  source: string
  darkMode: boolean
  components?: any
  defaultExpanded?: boolean
  onSectionsChange?: (sections: MarkdownSection[]) => void
  onSectionToggle?: (sectionId: string) => void
  externalCollapsedSections?: Set<string>
}

// Memoized components configuration
const createComponents = (darkMode: boolean) => ({
  pre: ({ children, ...props }: any) => {
    const preClassName = props.className || ''
    const preMatch = /language-(mermaid|mermaidjs)/.exec(preClassName)
    
    if (preMatch) {
      let mermaidCode = ''
      if (Array.isArray(children)) {
        children.forEach((child: any) => {
          if (child && child.props && child.props.children) {
            if (typeof child.props.children === 'string') {
              mermaidCode += child.props.children
            } else if (Array.isArray(child.props.children)) {
              mermaidCode += child.props.children.filter((c: any) => typeof c === 'string').join('')
            }
          }
        })
      }
      
      if (mermaidCode) {
        return <MermaidDiagram chart={mermaidCode} darkMode={darkMode} />
      }
    }
    
    return <pre {...props}>{children}</pre>
  },
  code: ({ children, className, ...props }: any) => {
    const match = /language-(mermaid|mermaidjs)/.exec(className || '')
    const isMermaid = !!match
    const isInline = !className
    
    if (isMermaid && !isInline) {
      let mermaidCode = ''
      if (Array.isArray(children)) {
        children.forEach((child: any) => {
          if (typeof child === 'string') {
            mermaidCode += child
          } else if (child && typeof child === 'object' && child.props) {
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
    
    if (isInline) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
    
    return (
      <CodeBlock className={className} darkMode={darkMode}>
        {children}
      </CodeBlock>
    )
  },
})

// Optimized Section component
const Section = memo(({ 
  section, 
  darkMode, 
  isCollapsed, 
  copiedSection,
  onToggle, 
  onCopy,
  components,
  renderChildren
}: {
  section: MarkdownSection
  darkMode: boolean
  isCollapsed: boolean
  copiedSection: string | null
  onToggle: () => void
  onCopy: () => void
  components: any
  renderChildren: () => React.ReactNode
}) => {
  const hasChildren = section.children.length > 0
  
  return (
    <div id={section.id} className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden relative group`}>
      <div className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <button
          onClick={onToggle}
          className={`flex-1 flex items-center justify-between ${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-100'} transition-colors rounded px-2 py-1`}
        >
          <div className="flex items-center">
            {hasChildren && (
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            )}
            <h2 className={`font-semibold text-left ${darkMode ? 'text-gray-100' : 'text-gray-900'} ${
              section.level === 1 ? 'text-xl' : 
              section.level === 2 ? 'text-lg' : 
              section.level === 3 ? 'text-base' : 
              'text-sm'
            }`}>
              {section.title}
            </h2>
          </div>
        </button>
        <button
          onClick={onCopy}
          className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors opacity-0 group-hover:opacity-100`}
          title={hasChildren ? "Copy section with all subsections" : "Copy section"}
        >
          {copiedSection === section.id ? (
            <Check className={`h-4 w-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          ) : (
            <Copy className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          )}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          {section.contentOnly && (
            <div className={`p-4 ${hasChildren ? 'pb-2' : ''}`}>
              <MarkdownPreview
                source={section.contentOnly}
                style={{ backgroundColor: 'transparent' }}
                wrapperElement={{
                  "data-color-mode": darkMode ? "dark" : "light"
                }}
                rehypePlugins={[
                  [rehypeHighlight, { 
                    detect: true,
                    subset: false,
                    ignoreMissing: true,
                    plainText: ['txt', 'text']
                  }],
                  rehypeRaw
                ]}
                components={components}
              />
            </div>
          )}
          
          {hasChildren && (
            <div className="p-4 pt-2 space-y-3">
              {renderChildren()}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

Section.displayName = 'Section'

export default function MarkdownSectionView({ 
  source, 
  darkMode, 
  components, 
  defaultExpanded = true,
  onSectionsChange,
  onSectionToggle,
  externalCollapsedSections
}: MarkdownSectionViewProps) {
  const [internalCollapsedSections, setInternalCollapsedSections] = useState<Set<string>>(new Set())
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  
  // Use external collapsed sections if provided, otherwise use internal state
  const collapsedSections = externalCollapsedSections ?? internalCollapsedSections
  const setCollapsedSections = externalCollapsedSections ? () => {} : setInternalCollapsedSections
  
  // Parse markdown into hierarchical sections
  const sections = useMemo(() => {
    const lines = source.split('\n')
    const flatSections: MarkdownSection[] = []
    let currentSection: MarkdownSection | null = null
    let contentLines: string[] = []
    let contentOnlyLines: string[] = []
    let inCodeBlock = false
    let codeBlockDelimiter = ''

    lines.forEach((line, index) => {
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
    } else if (contentLines.length > 0) {
      flatSections.push({
        id: 'section-0',
        level: 0,
        title: 'Document',
        content: contentLines.join('\n').trim(),
        contentOnly: contentLines.join('\n').trim(),
        children: []
      })
    }

    // Build hierarchy
    const rootSections: MarkdownSection[] = []
    const stack: MarkdownSection[] = []

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

    return rootSections
  }, [source])
  
  // Notify parent about sections structure
  useEffect(() => {
    if (onSectionsChange) {
      onSectionsChange(sections)
    }
  }, [sections, onSectionsChange])

  // Only handle defaultExpanded on initial mount if not using external control
  useEffect(() => {
    if (!externalCollapsedSections && !defaultExpanded) {
      const allSectionIds = new Set<string>()
      const collectIds = (sections: MarkdownSection[]) => {
        sections.forEach(section => {
          allSectionIds.add(section.id)
          if (section.children.length > 0) {
            collectIds(section.children)
          }
        })
      }
      collectIds(sections)
      setCollapsedSections(allSectionIds)
    }
  }, []) // Only run on mount

  const toggleSection = useCallback((sectionId: string) => {
    if (onSectionToggle) {
      onSectionToggle(sectionId)
    } else {
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
  }, [onSectionToggle])

  const copySection = useCallback(async (section: MarkdownSection, includeChildren: boolean) => {
    try {
      let content: string
      // Always include children when copying to match hierarchical behavior
      const getFullContent = (s: MarkdownSection): string => {
        let c = s.content
        if (s.children.length > 0) {
          c += '\n\n' + s.children.map(child => getFullContent(child)).join('\n\n')
        }
        return c
      }
      content = getFullContent(section)
      setCopiedSection(section.id)
      
      await navigator.clipboard.writeText(content)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  const mergedComponents = useMemo(() => {
    const defaultComponents = createComponents(darkMode)
    return { ...defaultComponents, ...components }
  }, [darkMode, components])

  const renderSection = useCallback((section: MarkdownSection, depth: number = 0) => {
    // Check visibility
    let current = section.parent
    while (current) {
      if (collapsedSections.has(current.id)) {
        return null
      }
      current = current.parent
    }
    
    const isCollapsed = collapsedSections.has(section.id)
    
    return (
      <Section
        key={section.id}
        section={section}
        darkMode={darkMode}
        isCollapsed={isCollapsed}
        copiedSection={copiedSection}
        onToggle={() => toggleSection(section.id)}
        onCopy={() => copySection(section, true)}
        components={mergedComponents}
        renderChildren={() => section.children.map(child => renderSection(child, depth + 1))}
      />
    )
  }, [collapsedSections, copiedSection, darkMode, mergedComponents, toggleSection, copySection])

  return (
    <div className="space-y-2">
      {sections.map(section => renderSection(section))}
    </div>
  )
}