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
          // チャートが空または空白のみの場合はスキップ
          const trimmedChart = chart.trim()
          if (!trimmedChart) {
            console.warn('Empty mermaid chart provided')
            if (ref.current) {
              ref.current.innerHTML = '<div style="color: #6b7280; font-style: italic;">Empty diagram</div>'
            }
            return
          }
          
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
          const { svg } = await mermaid.render(id, trimmedChart)
          
          // SVGを直接挿入
          if (ref.current) {
            ref.current.innerHTML = svg
          }
        } catch (error: any) {
          console.error('Mermaid rendering error:', error)
          console.error('Chart content:', trimmedChart)
          if (ref.current) {
            const errorMessage = error.message || error.toString()
            if (errorMessage.includes('No diagram type detected')) {
              ref.current.innerHTML = `<div style="color: #ef4444; background: #fee; padding: 12px; border-radius: 4px; border: 1px solid #fbb;">
                <strong>Invalid Mermaid diagram</strong><br/>
                <span style="font-size: 14px;">No valid diagram type detected. Please check your Mermaid syntax.</span><br/>
                <details style="margin-top: 8px;">
                  <summary style="cursor: pointer;">Show diagram content</summary>
                  <pre style="margin-top: 8px; font-size: 12px; overflow-x: auto;">${trimmedChart.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                </details>
              </div>`
            } else {
              ref.current.innerHTML = `<div style="color: #ef4444; background: #fee; padding: 12px; border-radius: 4px; border: 1px solid #fbb;">
                <strong>Mermaid syntax error</strong><br/>
                <span style="font-size: 14px;">${errorMessage}</span>
              </div>`
            }
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