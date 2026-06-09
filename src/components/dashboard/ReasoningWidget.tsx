'use client'

import React, { useState } from 'react'
import {
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Compass,
  ShieldCheck,
  Layers,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { ReasoningResult, ReasoningStep, StreamingReasoning, isReasoningResult, isPartialThoughts } from '@/types/ai'

interface ReasoningWidgetProps {
  result: StreamingReasoning
}

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

function confidenceColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 70) return 'bg-amber-500'
  return 'bg-rose-500'
}

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
          style={{ width: animate ? `${value}%` : '0%' }}
        />
      </div>
    </div>
  )
}

export default function ReasoningWidget({ result }: ReasoningWidgetProps) {
  // 💡 유저가 수동으로 '닫거나 선택한 아코디언 ID'만 제어 상태로 유지합니다.
  const [activeStepId, setActiveStepId] = useState<string | null>(null)
  // 유저가 아코디언을 최소 한 번 이상 직접 클릭했는지 여부 추적 플래그
  const [isInteracted, setIsInteracted] = useState(false)

  // ── 1. [스트리밍 연산 단계 실시간 대기 뷰 가드] ──
  if (!isReasoningResult(result)) {
    const liveThoughts = isPartialThoughts(result)
      ? result.thoughts
      : '심층 논리 연산 레이어 가동 중...';

    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-500 animate-spin" />
            <h3 className="font-bold text-sm tracking-tight">
              Chain of Thought <span className="text-muted-foreground font-normal">(AI 논리 사고 전개 중)</span>
            </h3>
          </div>
        </div>

        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Thinking Process
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap">
            {liveThoughts}
          </p>
        </div>
      </div>
    )
  }

  // ── 2. [파생 상태(Derived State) 결정 아키텍처] ──
  // 유저가 조작한 적이 없다면 실시간 Props로 들어온 첫 번째 단계의 id를 자동 할당하고, 조작했다면 수동 선택값을 따릅니다.
  const currentOpenId = isInteracted ? activeStepId : (result.steps[0]?.id ?? null)

  // 모든 단계를 유저가 확인했거나 아코디언을 모두 접었을 때 종합 결론부 자동 노출 파생 변수
  const isAllStepsCompleted = result.steps.every((s) => s.id !== currentOpenId)
  const showConclusion = isAllStepsCompleted || currentOpenId === null

  const handleToggle = (id: string) => {
    setIsInteracted(true) // 유저 인터랙션 개시 플래그 업
    setActiveStepId((prev) => (prev === id ? null : id))
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
      {result.query && (
        <div className="px-4 py-3 bg-muted/40 border border-border rounded-xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            분석 대상 쿼리
          </p>
          <p className="text-xs font-semibold leading-relaxed text-foreground">{result.query}</p>
        </div>
      )}

      {/* CoT 아코디언 단계 */}
      <div className="space-y-2.5">
        {result.steps.map((step, index) => {
          const isOpen = currentOpenId === step.id
          const phase = PHASE_CONFIG[step.phase] || PHASE_CONFIG['스캔']

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
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${phase.bg} ${phase.color} ${phase.border} shrink-0`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold tracking-tight">{step.title}</span>
                </span>

                <div className="flex items-center gap-2 shrink-0">
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
        className={`transition-all duration-500 overflow-hidden ${showConclusion ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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