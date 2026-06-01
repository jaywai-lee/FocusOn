'use client'

import React, { useState, useEffect } from 'react'
import {
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Compass,
  ShieldCheck,
  Layers,
  CheckCircle2,
} from 'lucide-react'
import { ReasoningResult, ReasoningStep } from '@/lib/ai/prompts'

interface ReasoningWidgetProps {
  result: ReasoningResult
}

// 단계별 phase 아이콘 및 컬러 매핑
const PHASE_CONFIG: Record<
  ReasoningStep['phase'],
  { icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  스캔: {
    icon: <Layers className="w-3.5 h-3.5" />,
    color: 'text-sky-600',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
  검증: {
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  결론: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
}

// 신뢰도 수치 → 진행 바 컬러 결정
function confidenceColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 70) return 'bg-amber-500'
  return 'bg-rose-500'
}

// 신뢰도 바 컴포넌트 (리액트 상태를 제거하여 60라인 무한루프 에러를 근본적으로 해결)
function ConfidenceBar({ value, animate }: { value: number; animate: boolean }) {
  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
          신뢰도
        </span>
        <span className="text-[10px] font-black text-foreground">{value}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${confidenceColor(value)}`}
          // 아코디언이 열린(animate) 상태일 때만 제 너비를 찾아가도록 유연하게 연출
          style={{ width: animate ? `${value}%` : '0%' }}
        />
      </div>
    </div>
  )
}

export default function ReasoningWidget({ result }: ReasoningWidgetProps) {
  // 기본값: 첫 번째 아코디언을 열어둠
  const [openStep, setOpenStep] = useState<string | null>(result.steps[0]?.id ?? null)
  const [showConclusion, setShowConclusion] = useState(false)

  // 모든 단계를 순서대로 모두 열었을 때 결론을 자동 노출
  useEffect(() => {
    const allSubmitted = result.steps.every((s) => s.id !== openStep)
    if (allSubmitted) {
      const timer = setTimeout(() => setShowConclusion(true), 300)
      return () => clearTimeout(timer)
    }
  }, [openStep, result.steps])

  const handleToggle = (id: string) => {
    setOpenStep((prev) => (prev === id ? null : id))
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5 transition-colors duration-300">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-500" />
          <h3 className="font-bold text-sm tracking-tight">
            Chain of Thought <span className="text-muted-foreground font-normal">(논증 추론 단계)</span>
          </h3>
        </div>
        <span className="text-[9px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          심층 모드 활성
        </span>
      </div>

      {/* 분석 쿼리 표시 */}
      <div className="px-4 py-3 bg-muted/40 border border-border rounded-xl">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
          분석 대상 쿼리
        </p>
        <p className="text-xs font-semibold leading-relaxed text-foreground">{result.query}</p>
      </div>

      {/* CoT 아코디언 단계 */}
      <div className="space-y-2.5">
        {result.steps.map((step, index) => {
          const isOpen = openStep === step.id
          const phase = PHASE_CONFIG[step.phase]

          return (
            <div
              key={step.id}
              className="border border-border rounded-xl overflow-hidden bg-muted/10 transition-colors duration-200"
            >
              <button
                onClick={() => handleToggle(step.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  {/* 단계 번호 배지 */}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${phase.bg} ${phase.color} ${phase.border} shrink-0`}
                  >
                    {index + 1}
                  </span>

                  {/* 단계 제목 */}
                  <span className="text-xs font-bold tracking-tight">{step.title}</span>
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  {/* phase 뱃지 */}
                  <span
                    className={`hidden sm:flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border ${phase.bg} ${phase.color} ${phase.border}`}
                  >
                    {phase.icon}
                    {step.phase}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* 펼쳐지는 내용 */}
              {isOpen && (
                <div className="px-4 pb-4 bg-card border-t border-border">
                  <p className="text-[12px] text-muted-foreground leading-relaxed mt-3">
                    {step.description}
                  </p>
                  <ConfidenceBar value={step.confidence} animate={isOpen} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 최종 결론 패널 */}
      <div
        className={`transition-all duration-500 overflow-hidden ${showConclusion || openStep === null ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3 transition-colors duration-300">
          <BrainCircuit className="w-5 h-5 text-primary mt-0.5 shrink-0 transition-colors duration-300" />
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold tracking-tight">AI 추론 종합 결론</h4>
              <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 transition-colors duration-300">
                팩트 정확도 {result.factAccuracy}%
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {result.finalConclusion}
            </p>

            {/* 전체 정확도 바 */}
            <div className="mt-1 space-y-1">
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 bg-primary rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${result.factAccuracy}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}