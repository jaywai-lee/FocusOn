import React from 'react'
import type { Metadata } from 'next'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'FocusOn - 초개인화 AI 학습 플랫폼',
  description: 'AI와 함께하는 스마트한 지식 캡처 및 학습 대시보드',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased selection:bg-primary/20">
        {/* 🚨 [컨텍스트 주입 확정]: AuthProvider를 최상단에 배치하여 하위 라우트 전체를 철벽 방어 */}
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}