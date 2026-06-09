'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrainCircuit, Mail, Lock, ArrowRight, Loader2, AlertCircle, Zap, UserPlus, LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false) // 💡 로그인 <-> 회원가입 폼 스위칭 상태
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // 폼 스위칭 시 에러 및 입력값 초기화 리셋터
  const toggleMode = () => {
    setIsSignUp((prev) => !prev)
    setError(null)
    setSuccessMessage(null)
    setPassword('')
  }

  // 🚀 통합 인증 처리 핸들러 (로그인 & 회원가입)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.')
      return
    }
    setIsLoading(true); setError(null); setSuccessMessage(null)

    if (isSignUp) {
      // ── ① Supabase 회원가입 (Sign Up) 파이프라인 ──
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (signUpError) {
        setError(signUpError.message || '회원가입 중 오류가 발생했습니다.')
        setIsLoading(false); return
      }

      // Supabase 설정에서 이메일 인증(Confirm email)이 켜져 있는 경우의 예외 방어 가드
      if (data.session === null) {
        setSuccessMessage('회원가입 신청이 완료되었습니다! 이메일 인증함을 확인해 주세요.')
        setIsLoading(false); return
      }

      // 이메일 인증이 꺼져있다면 가입 즉시 세션이 잡히므로 바로 대시보드로 이동
      router.push('/dashboard'); router.refresh()
    } else {
      // ── ② Supabase 로그인 (Sign In) 파이프라인 ──
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        setError('이메일 또는 비밀번호가 올바르지 않거나 인증되지 않았습니다.')
        setIsLoading(false); return
      }
      router.push('/dashboard'); router.refresh()
    }
  }

  const handleDemoLogin = async (demoEmail: string) => {
    setIsLoading(true); setError(null); setSuccessMessage(null)
    setIsSignUp(false) // 데모 클릭 시 로그인 모드로 강제 스위칭
    setEmail(demoEmail); setPassword('focuson2026!')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: 'focuson2026!',
    })

    if (authError) {
      setError('데모 계정 로그인 실패. Supabase 등록 상태를 확인하세요.')
      setIsLoading(false); return
    }
    router.push('/dashboard'); router.refresh()
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-[#0f172a] flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-50/70 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-50/60 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 transition-all duration-500">
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-slate-200/60 to-transparent blur-[2px]" />

        <div className="relative bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-200/40">

          {/* 브랜드 헤더 */}
          <div className="flex flex-col items-center gap-3.5 mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-indigo-100/50 blur-lg scale-125" />
              <div className="relative p-3.5 bg-primary text-primary-foreground rounded-2xl shadow-md shadow-primary/10">
                <BrainCircuit className="w-6 h-6" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                FocusOn
              </h1>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
                {isSignUp ? '신규 계정 생성 등록' : '초개인화 AI 학습 플랫폼'}
              </p>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null) }}
                  placeholder="your@email.com"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/70 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null) }}
                  placeholder="6자리 이상 입력하세요"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/70 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* 에러 피드백 배너 */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                <p className="text-xs text-rose-600 leading-relaxed font-medium">{error}</p>
              </div>
            )}

            {/* 가입 완료 안내 배너 */}
            {successMessage && (
              <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <Zap className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-600 leading-relaxed font-medium">{successMessage}</p>
              </div>
            )}

            {/* 메인 제어 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-bold text-xs rounded-xl transition-all shadow-sm shadow-primary/10 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="font-extrabold">{isSignUp ? '포커스온 계정 만들기' : '대시보드 입장하기'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 모드 전환 토글 링크 링크 버튼 */}
          <div className="text-center mt-4">
            <button
              onClick={toggleMode}
              disabled={isLoading}
              className="text-[11px] font-bold text-primary hover:underline bg-transparent border-none cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
            >
              {isSignUp ? (
                <>
                  <LogIn className="w-3 h-3" /> 이미 계정이 있으신가요? 로그인하기
                </>
              ) : (
                <>
                  <UserPlus className="w-3 h-3" /> 첫 방문이신가요? 5초만에 회원가입하기
                </>
              )}
            </button>
          </div>

          {/* 데모 로그인 진 영역 (로그인 모드일 때만 하단에 부드럽게 노출) */}
          {!isSignUp && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-200/60" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">데모 퀵 로그인</span>
                <div className="flex-1 h-px bg-slate-200/60" />
              </div>

              <div className="space-y-2">
                {[
                  { email: 'fast_learner@focuson.ai', label: '개념 요약 모드', color: 'bg-sky-50/40 border-sky-100 text-sky-700 hover:bg-sky-50' },
                  { email: 'quiz_challenger@focuson.ai', label: '퀴즈 생성 모드', color: 'bg-indigo-50/40 border-indigo-100 text-indigo-700 hover:bg-indigo-50' },
                  { email: 'deep_philosopher@focuson.ai', label: '심층 추론 모드', color: 'bg-emerald-50/40 border-emerald-100 text-emerald-700 hover:bg-emerald-50' },
                ].map((demo) => (
                  <button
                    key={demo.email}
                    onClick={() => handleDemoLogin(demo.email)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl font-semibold text-xs transition-all disabled:opacity-40 cursor-pointer ${demo.color}`}
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-3.5 h-3.5 shrink-0" />
                      <div className="text-left">
                        <div className="text-[11px] font-bold">{demo.label}</div>
                        <div className="text-[9px] font-medium opacity-60 font-mono">{demo.email}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="text-center text-[9px] text-slate-400 mt-5 font-mono">
            데모 계정 비밀번호: <span className="text-slate-500 font-bold">focuson2026!</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-5 text-[9px] text-slate-400 font-mono tracking-wider">
        FOCUSON.AI © 2026 · POWERED BY GEMINI & NEXT.JS
      </div>
    </div>
  )
}