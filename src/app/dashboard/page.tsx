'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/providers/AuthProvider'
import {
  FileQuestion,
  BrainCircuit,
  Sun,
  Moon,
  LayoutDashboard,
  BookOpen,
  Settings,
  Sparkles,
  ArrowRight,
  User,
  LogOut,
  Lightbulb,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react'
import QuizWidget from '@/components/dashboard/QuizWidget'
import ReasoningWidget from '@/components/dashboard/ReasoningWidget'
import { MOCK_DIGEST, MOCK_QUIZ, MOCK_REASONING } from '@/lib/ai/prompts'
import { QuizQuestion, ReasoningResult, StreamingReasoning, extractPureJson } from '@/types/ai'

export default function DashboardPage() {
  const router = useRouter()
  const { theme, toggleTheme, focusMode, setFocusMode } = useTheme()
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const [inputContent, setInputContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // 🚨 [버그 종결 핵심 아키텍처]: 각 모드별로 스트리밍 텍스트 버퍼를 철저히 격리합니다.
  const [digestText, setDigestText] = useState('')         // 개념 요약 전용 실시간 텍스트
  const [reasoningStream, setReasoningStream] = useState('') // 심층 추론 과정 실시간 텍스트

  const [parsedQuiz, setParsedQuiz] = useState<QuizQuestion[] | null>(null)
  const [parsedReasoning, setParsedReasoning] = useState<StreamingReasoning | null>(null)

  /**
   * 🛠️ 탭 스위칭 핸들러: 모드를 바꿀 때 이전 버퍼와 에러를 깨끗하게 청소합니다.
   */
  const handleModeChange = (mode: typeof focusMode) => {
    setFocusMode(mode)
    setApiError(null)
    // 💡 다른 모드의 화면을 보다가 복귀했을 때 이전 찌꺼기가 보이는 것을 방지
    if (!isLoading) {
      setDigestText('')
      setReasoningStream('')
      setParsedQuiz(null)
      setParsedReasoning(null)
    }
  }

  /**
   * 🛠️ [실시간 부분 JSON 복원 파서]
   */
  const parsePartialQuizJson = (jsonString: string): QuizQuestion[] | null => {
    let cleanStr = jsonString.trim()
    if (!cleanStr) return null

    if (!cleanStr.startsWith('[')) {
      if (cleanStr.startsWith('{')) {
        cleanStr = '[' + cleanStr
      } else {
        return null
      }
    }

    let openBrackets = 0
    let openBraces = 0
    let inString = false
    let escaped = false

    for (let i = 0; i < cleanStr.length; i++) {
      const char = cleanStr[i]
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === '"') {
        inString = !inString
        continue
      }
      if (!inString) {
        if (char === '[') openBrackets++
        if (char === ']') openBrackets--
        if (char === '{') openBraces++
        if (char === '}') openBraces--
      }
    }

    if (inString) cleanStr += '"'
    while (openBraces > 0) {
      cleanStr += '}'
      openBraces--
    }
    while (openBrackets > 0) {
      cleanStr += ']'
      openBrackets--
    }

    try {
      let targetJson = cleanStr
      if (targetJson.endsWith(',]')) {
        targetJson = targetJson.slice(0, -2) + ']'
      }
      const parsed = JSON.parse(targetJson) as QuizQuestion[]
      return parsed.length > 0 ? parsed : null
    } catch {
      return null
    }
  }

  /**
   * 🚀 실시간 AI 스트리밍 파이프라인 트리거
   */
  const handleAnalyze = async () => {
    if (!inputContent.trim()) return
    setIsLoading(true)
    setApiError(null)
    setDigestText(''); setReasoningStream('')
    setParsedQuiz(null); setParsedReasoning(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputContent, focusMode })
      })
      if (!res.ok) {
        const errData = (await res.json()) as { details?: string }
        throw new Error(errData.details || '통신 실패')
      }

      const reader: ReadableStreamDefaultReader<Uint8Array> | undefined = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return
      let acc = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        acc += chunk

        if (focusMode === 'FAST_DIGEST') {
          setDigestText(acc)
        } else if (focusMode === 'QUIZ_BUILDER') {
          const liveQuiz = parsePartialQuizJson(acc)
          if (liveQuiz) setParsedQuiz(liveQuiz)
        } else if (focusMode === 'DEEP_REASONING') {
          setReasoningStream(acc)
          try {
            setParsedReasoning(JSON.parse(acc) as StreamingReasoning)
          } catch {
            setParsedReasoning({ thoughts: acc })
          }
        }
      }

      const finalJson = extractPureJson(acc)

      try {
        if (focusMode === 'QUIZ_BUILDER') setParsedQuiz(JSON.parse(finalJson) as QuizQuestion[])
        if (focusMode === 'DEEP_REASONING') setParsedReasoning(JSON.parse(finalJson) as ReasoningResult)
      } catch (e) {
        console.error('파싱 실패, 세이프티 가동', e)
        if (focusMode === 'QUIZ_BUILDER') setParsedQuiz(MOCK_QUIZ)
        if (focusMode === 'DEEP_REASONING') setParsedReasoning(MOCK_REASONING)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '인프라 연결 실패'
      setApiError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-dashboard-bg text-foreground transition-colors duration-300 font-sans tracking-tight overflow-hidden">

      {/* 1. 좌측 사이드바 */}
      <aside className="w-64 bg-card border-r border-border p-5 shrink-0 hidden md:flex md:flex-col md:justify-between transition-colors duration-300 h-full">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="p-1.5 bg-primary text-primary-foreground rounded-xl transition-colors duration-300">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="font-bold text-base tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FocusOn
            </span>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-primary/10 text-primary transition-colors duration-300 text-left">
              <LayoutDashboard className="w-4 h-4" />
              대시보드 메인
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all text-left">
              <BookOpen className="w-4 h-4" />
              오답노트 / 보관함
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all text-left">
              <Settings className="w-4 h-4" />
              서비스 설정
            </button>
          </nav>
        </div>

        <div className="space-y-2 mt-auto pt-4 border-t border-border/40 w-full">
          {user ? (
            /* ① 로그인 성공 상태: 프로필 칩 + 로그아웃 버튼 노출 */
            <>
              <div className="flex items-center gap-2.5 px-2.5 py-2 bg-muted/30 rounded-xl border border-border/40">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-bold truncate text-foreground">
                    {user.email?.split('@')[0] ?? '사용자'}
                  </span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {focusMode === 'FAST_DIGEST' ? '개념 요약' : focusMode === 'QUIZ_BUILDER' ? '퀴즈 생성' : '심층 추론'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </>
          ) : (
            /* ② 비로그인 상태: 대시보드 톤앤매너와 어우러지는 [로그인하기] 전환 버튼 노출 */
            <button
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center border border-primary/20"
            >
              로그인하기
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </aside>

      {/* 2. 메인 대시보드 우측 영역 */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-2.5">
            <div className="p-1 bg-primary text-primary-foreground rounded-lg md:hidden transition-colors duration-300">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent md:hidden mr-2">
              FocusOn
            </span>
            <div className="hidden sm:flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <h1 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Workspace Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={toggleTheme} className="p-2 bg-muted hover:bg-border rounded-xl transition-all cursor-pointer text-muted-foreground hover:text-foreground">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto flex flex-col justify-between">
          <main className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1">

            {/* 학습 텍스트 입력 패널 */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3 transition-colors duration-300">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">학습 컨텐츠 소스 입력</label>
              <div className="flex gap-2">
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="요약하거나 퀴즈로 가공하고 싶은 IT 기술 명세나 학습 텍스트를 입력해 주세요..."
                  className="flex-1 min-h-[70px] max-h-[160px] p-3 bg-muted/50 border border-border rounded-xl text-xs font-medium focus:outline-hidden focus:border-primary focus:bg-card transition-all resize-none leading-relaxed"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || !inputContent.trim()}
                  className="px-4 bg-primary hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed text-primary-foreground font-bold text-xs rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs shadow-primary/10"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="text-[10px]">AI 분석</span>
                </button>
              </div>
            </div>

            {/* 기능 모드 스위칭 탭 버튼 */}
            <div className="w-full flex md:justify-center border-b border-border pb-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex bg-muted/60 p-1.5 rounded-2xl gap-1.5 border border-border/60 whitespace-nowrap min-w-max md:min-w-0">
                <button onClick={() => handleModeChange('FAST_DIGEST')} className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${focusMode === 'FAST_DIGEST' ? 'bg-card text-primary shadow-xs border border-border/30 scale-[1.01]' : 'text-muted-foreground hover:text-foreground hover:bg-card/40'}`}>
                  <Lightbulb className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 text-primary" />
                  개념 요약 모드
                </button>
                <button onClick={() => handleModeChange('QUIZ_BUILDER')} className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${focusMode === 'QUIZ_BUILDER' ? 'bg-card text-primary shadow-xs border border-border/30 scale-[1.01]' : 'text-muted-foreground hover:text-foreground hover:bg-card/40'}`}>
                  <FileQuestion className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 text-indigo-500" />
                  퀴즈 생성 모드
                </button>
                <button onClick={() => handleModeChange('DEEP_REASONING')} className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${focusMode === 'DEEP_REASONING' ? 'bg-card text-primary shadow-xs border border-border/30 scale-[1.01]' : 'text-muted-foreground hover:text-foreground hover:bg-card/40'}`}>
                  <BrainCircuit className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 text-emerald-500" />
                  심층 추론 모드
                </button>
              </div>
            </div>

            {apiError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl flex items-start gap-3 text-xs font-semibold leading-relaxed animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{apiError}</div>
              </div>
            )}

            {/* 다이내믹 AI 출력 레이어 */}
            <div className="transition-all duration-300">
              {focusMode === 'FAST_DIGEST' && (
                <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors duration-300">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Lightbulb className="w-4 h-4 text-primary shrink-0" />
                      <h3 className="font-bold text-xs sm:text-sm tracking-tight truncate">
                        {digestText ? 'AI 맞춤형 개념 브리핑 수집 중...' : MOCK_DIGEST.title}
                      </h3>
                    </div>
                  </div>

                  {digestText ? (
                    <div className="text-xs sm:text-[13px] leading-relaxed text-foreground whitespace-pre-wrap font-medium">
                      <span dangerouslySetInnerHTML={{ __html: digestText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>') }} />
                    </div>
                  ) : (
                    <ul className="space-y-2.5 py-1">
                      {MOCK_DIGEST.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-[13px] text-foreground/90 leading-relaxed">
                          <ArrowRight className="w-3.5 h-3.5 text-primary mt-1 shrink-0" />
                          <span dangerouslySetInnerHTML={{ __html: bullet.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>') }} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {focusMode === 'QUIZ_BUILDER' && (
                <QuizWidget questions={parsedQuiz || (isLoading ? [] : (apiError ? [] : MOCK_QUIZ))} />
              )}

              {/* 🚨 [버그 정밀 조치 영역]: 심층 추론 모드 로딩 스켈레톤 마크업 가드 수립 */}
              {focusMode === 'DEEP_REASONING' && (
                isLoading && !parsedReasoning ? (
                  <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center gap-3 animate-pulse transition-colors duration-300">
                    <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
                    <p className="text-xs font-bold text-muted-foreground tracking-tight">
                      AI가 컨텐츠 내부의 복잡한 논리 구조를 심층 추론하고 있습니다...
                    </p>
                  </div>
                ) : (
                  <ReasoningWidget result={parsedReasoning || MOCK_REASONING} />
                )
              )}
            </div>
          </main>

          <footer className="w-full h-12 border-t border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 text-[9px] sm:text-[10px] text-muted-foreground font-mono transition-colors duration-300">
            <div>© 2026 FOCUSON.AI</div>
            <div>POWERED BY GEMINI 2.5 FLASH & NEXT.JS</div>
          </footer>
        </div>
      </div>
    </div>
  )
}