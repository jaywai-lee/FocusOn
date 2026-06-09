'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 💡 세션 쿠키 업데이트 함수의 타입을 Session | null 로 명시하여 유연하게 가드
  const updateSessionCookie = (session: Session | null) => {
    if (session && session.access_token) {
      const maxAge = session.expires_in || 3600
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`
    } else {
      document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax'
    }
  }

  useEffect(() => {
    // 1. 초기 세션 획득
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      updateSessionCookie(session)
      setLoading(false)
    })

    // 2. 인증 상태 변화 감지 리스너 등록
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      updateSessionCookie(session)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax'
    setUser(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}