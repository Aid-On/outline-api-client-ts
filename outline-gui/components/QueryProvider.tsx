'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // キャッシュ時間: 5分
      staleTime: 5 * 60 * 1000,
      // キャッシュの有効期限: 10分
      gcTime: 10 * 60 * 1000,
      // リトライ回数
      retry: 1,
      // ウィンドウフォーカス時の再フェッチを無効化
      refetchOnWindowFocus: false,
    },
  },
})

export default function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}