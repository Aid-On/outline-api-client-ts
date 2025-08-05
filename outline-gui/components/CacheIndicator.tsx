'use client'

import { useQuery } from '@tanstack/react-query'
import { Clock } from 'lucide-react'

interface CacheIndicatorProps {
  queryKey: any[]
  className?: string
}

export default function CacheIndicator({ queryKey, className = '' }: CacheIndicatorProps) {
  const query = useQuery({
    queryKey,
    queryFn: () => Promise.resolve(null), // ダミーのqueryFn
    enabled: false, // クエリを実行しない、状態のみ取得
  })

  if (!query.dataUpdatedAt) return null

  const age = Date.now() - query.dataUpdatedAt
  const minutes = Math.floor(age / 60000)
  const seconds = Math.floor((age % 60000) / 1000)

  let ageText = ''
  if (minutes > 0) {
    ageText = `${minutes}m ${seconds}s ago`
  } else {
    ageText = `${seconds}s ago`
  }

  return (
    <div className={`flex items-center space-x-1 text-xs text-gray-500 ${className}`}>
      <Clock className="h-3 w-3" />
      <span>Cached {ageText}</span>
    </div>
  )
}