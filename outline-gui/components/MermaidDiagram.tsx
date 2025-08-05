'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
  darkMode?: boolean
}

export default function MermaidDiagram({ chart, darkMode = false }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && chart) {
      const renderMermaid = async () => {
        try {
          // ユニークなIDを生成
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
          
          // mermaidを初期化
          mermaid.initialize({
            startOnLoad: false,
            theme: darkMode ? 'dark' : 'default',
            themeVariables: darkMode ? {
              primaryColor: '#1f2937',
              primaryTextColor: '#e5e7eb',
              primaryBorderColor: '#374151',
              lineColor: '#6b7280',
              secondaryColor: '#374151',
              tertiaryColor: '#4b5563',
              background: '#111827',
              mainBkg: '#1f2937',
              secondBkg: '#374151',
              tertiaryBkg: '#4b5563',
              primaryBorderColor: '#6b7280',
              secondaryBorderColor: '#9ca3af',
              tertiaryBorderColor: '#d1d5db',
              noteBkgColor: '#fef3c7',
              noteTextColor: '#1f2937',
              textColor: '#e5e7eb',
              critical: '#ef4444',
              done: '#10b981',
              taskTextDarkColor: '#e5e7eb',
              taskTextColor: '#1f2937',
              activeTaskBorderColor: '#8b5cf6',
              activeTaskBkgColor: '#7c3aed'
            } : {}
          })
          
          // mermaid.render を使用
          const { svg } = await mermaid.render(id, chart)
          
          // SVGを直接挿入
          if (ref.current) {
            ref.current.innerHTML = svg
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error)
          if (ref.current) {
            ref.current.innerHTML = `<pre style="color: red;">Mermaid syntax error: ${error.message || error}</pre>`
          }
        }
      }

      renderMermaid()
    }
  }, [chart, darkMode])

  return (
    <div className="my-6 w-full">
      <div ref={ref} className="mermaid" />
    </div>
  )
}