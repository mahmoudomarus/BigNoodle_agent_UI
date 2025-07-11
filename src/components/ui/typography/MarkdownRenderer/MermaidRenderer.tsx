'use client'

import React, { useEffect, useRef } from 'react'

// Dynamically import mermaid to avoid SSR issues
const loadMermaid = async () => {
  if (typeof window !== 'undefined') {
    const mermaid = (await import('mermaid')).default
    return mermaid
  }
  return null
}

interface MermaidRendererProps {
  chart: string
  id?: string
}

const MermaidRenderer = ({ chart, id }: MermaidRendererProps) => {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderChart = async () => {
      if (elementRef.current && typeof window !== 'undefined') {
        try {
          const mermaid = await loadMermaid()
          if (!mermaid) return

          // Initialize mermaid
          mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit',
            fontSize: 14,
            themeVariables: {
              primaryColor: '#3b82f6',
              primaryTextColor: '#1f2937',
              primaryBorderColor: '#6b7280',
              lineColor: '#6b7280',
              sectionBkgColor: '#f9fafb',
              altSectionBkgColor: '#ffffff',
              gridColor: '#e5e7eb',
              secondaryColor: '#f3f4f6',
              tertiaryColor: '#ffffff',
            },
          })

          const chartId = id || `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          elementRef.current.innerHTML = ''
          
          const { svg } = await mermaid.render(chartId, chart)
          elementRef.current.innerHTML = svg
        } catch (error) {
          console.error('Error rendering Mermaid chart:', error)
          if (elementRef.current) {
            elementRef.current.innerHTML = `
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 font-medium">Error rendering chart</p>
                <p class="text-red-500 text-sm">Please check the Mermaid syntax</p>
              </div>
            `
          }
        }
      }
    }

    renderChart()
  }, [chart, id])

  return (
    <div className="my-4 p-4 bg-gray-50 rounded-lg border overflow-x-auto">
      <div ref={elementRef} className="mermaid-chart" />
    </div>
  )
}

export default MermaidRenderer 