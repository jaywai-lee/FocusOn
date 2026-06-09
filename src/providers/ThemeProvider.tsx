'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserProfile, MOCK_USER_SESSIONS, FocusModeType } from '@/lib/supabase'

type ThemeType = 'light' | 'dark'

interface ThemeContextType {
  user: UserProfile | null
  theme: ThemeType
  focusMode: FocusModeType
  setUser: (user: UserProfile | null) => void
  setTheme: (theme: ThemeType) => void
  toggleTheme: () => void
  setFocusMode: (mode: FocusModeType) => void
  simulateUserSession: (type: 'fastDigest' | 'quizBuilder' | 'deepReasoning') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 기본 세션으로 초고속 핵심 요약 모의 유저를 활성화해 둡니다.
  const [user, setUser] = useState<UserProfile | null>(MOCK_USER_SESSIONS.fastDigest)
  const [theme, setTheme] = useState<ThemeType>('light')
  const [focusMode, setFocusMode] = useState<FocusModeType>(MOCK_USER_SESSIONS.fastDigest.focusMode)

  // 테마 상태가 바뀔 때마다 HTML 루트 요소의 data-theme 속성을 스위칭합니다.
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)

    // 브라우저의 기본 background 컬러 스타일도 연동되도록 body 클래스를 맞춥니다.
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // 테마 토글 핸들러
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // 모의 세션을 즉각 스위칭하는 헬퍼
  const simulateUserSession = (type: 'fastDigest' | 'quizBuilder' | 'deepReasoning') => {
    const nextUser = MOCK_USER_SESSIONS[type]
    setUser(nextUser)
    setFocusMode(nextUser.focusMode)
  }


  return (
    <ThemeContext.Provider
      value={{
        user,
        theme,
        focusMode,
        setUser,
        setTheme,
        toggleTheme,
        setFocusMode,
        simulateUserSession
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
