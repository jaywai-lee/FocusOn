import Link from "next/link";
import { Sparkles, BrainCircuit, GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-slate-50 text-slate-900 font-sans min-h-screen relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-sky-200/40 blur-3xl" />

      <main className="z-10 flex flex-col items-center justify-center max-w-2xl px-6 py-16 text-center space-y-8">

        {/* Brand Icon */}
        <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-lg shadow-indigo-600/20 animate-bounce">
          <BrainCircuit className="w-12 h-12" />
        </div>

        {/* Hero Copy */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500 bg-clip-text text-transparent">
            FocusOn
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-slate-800">
            초개인화 AI 학습 보조 플랫폼
          </p>
          <p className="max-w-md mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
            학습자의 연령과 성별 등 프로필 데이터를 분석하여 최적의 AI 컨텍스트와 매끄러운 다이내믹 디자인 토큰 시스템을 실시간 매칭합니다.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-4">
          <div className="p-4 bg-white/70 border border-slate-200/80 rounded-2xl shadow-sm text-left flex items-start gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">도메인 컨텍스트 포커싱</h3>
              <p className="text-[11px] text-slate-500 mt-1">유저 데이터 기반 세그먼트 매핑 및 AI 학습 최적화</p>
            </div>
          </div>
          <div className="p-4 bg-white/70 border border-slate-200/80 rounded-2xl shadow-sm text-left flex items-start gap-3">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">다이내믹 디자인 토큰</h3>
              <p className="text-[11px] text-slate-500 mt-1">CSS 변수 결합을 통한 실시간 테마 스위칭 렌더링</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-6">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 font-bold text-sm text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all duration-300 hover:scale-[1.02]"
          >
            시뮬레이터 대시보드 입장하기
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-[10px] text-slate-400 font-medium font-mono">
        DEVELOPMENT PROTOCOLS © 2026 FOCUSON.AI
      </footer>
    </div>
  );
}

