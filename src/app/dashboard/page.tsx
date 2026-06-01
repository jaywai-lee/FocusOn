'use client'

import React from 'react'
import { useTheme } from '@/providers/ThemeProvider'
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
  LogOut,
  User,
  Lightbulb
} from 'lucide-react'
import QuizWidget from '@/components/dashboard/QuizWidget'
import ReasoningWidget from '@/components/dashboard/ReasoningWidget'
import { MOCK_DIGEST, MOCK_QUIZ, MOCK_REASONING } from '@/lib/ai/prompts'

export default function DashboardPage() {
  const { theme, toggleTheme, focusMode, setFocusMode, user } = useTheme()

  return (
    <div className="flex h-screen w-full bg-dashboard-bg text-foreground transition-colors duration-300 font-sans tracking-tight overflow-hidden">

      {/* 1. 좌측 사이드바 (데스크톱 전용) */}
      <aside className="w-64 bg-card border-r border-border flex flex-col justify-between p-5 shrink-0 hidden md:flex transition-colors duration-300 h-full">
        <div className="space-y-6">
          {/* 서비스 로고 */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="p-1.5 bg-primary text-primary-foreground rounded-xl transition-colors duration-300">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="font-bold text-base tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FocusOn
            </span>
          </div>

          {/* 네비게이션 메뉴 */}
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

        {/* 사이드바 최하단 미니 프로필 고정 (데스크톱 전용) */}
        {user && (
          <div className="flex items-center justify-between px-2 py-1 bg-muted/30 rounded-xl p-2.5 border border-border/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold truncate text-foreground">
                  {user.email.split('@')[0]}
                </span>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {focusMode === 'FAST_DIGEST' ? '개념 요약' : '심층 추론'}
                </span>
              </div>
            </div>
            <button
              className="p-1.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-lg transition-all cursor-pointer"
              title="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </aside>

      {/* 2. 메인 대시보드 우측 전체 영역 */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* 상단 헤더 바 (모바일 상태 로그아웃 버튼 인터페이스 추가) */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-2.5">
            {/* 모바일 화면에서만 노출되는 헤더 미니 로고 */}
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

          {/* 헤더 우측 컨트롤 액션 레이어 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 🚨 [모바일 전용 프로필 & 로그아웃 컴포넌트]: md 미만에서만 헤더에 노출 */}
            {user && (
              <div className="flex items-center gap-1.5 bg-muted/40 p-1 pr-2 rounded-xl border border-border/40 md:hidden max-w-[140px] sm:max-w-[180px]">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold truncate text-foreground max-w-[50px] sm:max-w-[90px]">
                  {user.email.split('@')[0]}
                </span>
                <div className="w-px h-2.5 bg-border mx-0.5" />
                <button
                  className="p-1 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-md transition-all cursor-pointer"
                  title="로그아웃"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* 테마 스위처 */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-muted hover:bg-border rounded-xl transition-all cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* 헤더 아래 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto flex flex-col justify-between">

          {/* 콘텐츠 피드 스페이스 */}
          <main className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1">

            {/* 모바일 반응형 탭 스크롤 바 */}
            <div className="w-full flex md:justify-center border-b border-border pb-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex bg-muted/60 p-1.5 rounded-2xl gap-1.5 border border-border/60 whitespace-nowrap min-w-max md:min-w-0">
                <button
                  onClick={() => setFocusMode('FAST_DIGEST')}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${focusMode === 'FAST_DIGEST'
                      ? 'bg-card text-primary shadow-xs border border-border/30 scale-[1.01]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                    }`}
                >
                  <Lightbulb className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 text-primary" />
                  개념 요약 모드
                </button>
                <button
                  onClick={() => setFocusMode('QUIZ_BUILDER')}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${focusMode === 'QUIZ_BUILDER'
                      ? 'bg-card text-primary shadow-xs border border-border/30 scale-[1.01]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                    }`}
                >
                  <FileQuestion className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 text-indigo-500" />
                  퀴즈 생성 모드
                </button>
                <button
                  onClick={() => setFocusMode('DEEP_REASONING')}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${focusMode === 'DEEP_REASONING'
                      ? 'bg-card text-primary shadow-xs border border-border/30 scale-[1.01]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                    }`}
                >
                  <BrainCircuit className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 text-emerald-500" />
                  심층 추론 모드
                </button>
              </div>
            </div>

            {/* 다이내믹 AI 컴포넌트 출력 피드 */}
            <div className="transition-all duration-300">
              {focusMode === 'FAST_DIGEST' && (
                <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors duration-300">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Lightbulb className="w-4 h-4 text-primary shrink-0" />
                      <h3 className="font-bold text-xs sm:text-sm tracking-tight truncate">{MOCK_DIGEST.title}</h3>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono font-medium shrink-0 ml-2">{MOCK_DIGEST.readingTime}</span>
                  </div>

                  <ul className="space-y-2.5 py-1">
                    {MOCK_DIGEST.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-[13px] text-foreground/90 leading-relaxed">
                        <ArrowRight className="w-3.5 h-3.5 text-primary mt-1 shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: bullet.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>') }} />
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 border-t border-border flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-muted-foreground font-bold mr-1 uppercase">Keywords:</span>
                    {MOCK_DIGEST.keywords.map((kw, i) => (
                      <span key={i} className="text-[11px] font-medium px-2.5 py-0.5 bg-muted rounded-full border border-border text-muted-foreground">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {focusMode === 'QUIZ_BUILDER' && (
                <QuizWidget questions={MOCK_QUIZ} />
              )}

              {focusMode === 'DEEP_REASONING' && (
                <ReasoningWidget result={MOCK_REASONING} />
              )}
            </div>
          </main>

          {/* 우측 하단 푸터 */}
          <footer className="w-full h-12 border-t border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 text-[9px] sm:text-[10px] text-muted-foreground font-mono transition-colors duration-300">
            <div>© 2026 FOCUSON.AI</div>
            <div className="hidden sm:block">POWERED BY VERCEL AI SDK & SUPABASE</div>
          </footer>

        </div>
      </div>
    </div>
  )
}