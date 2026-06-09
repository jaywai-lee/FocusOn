import { FocusModeType } from '@/lib/supabase'

export interface QuizQuestion {
  id: string
  question: string
  options: string[]          // 보기 4개
  correctIdx: number         // 0-based 정답 인덱스
  explanation: string        // 해설
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
}

export interface DigestSummary {
  title: string
  bullets: string[]
  keywords: string[]
  readingTime: string        // 예) "읽는 데 약 2분"
}

export interface ReasoningStep {
  id: string
  phase: '스캔' | '검증' | '결론'
  title: string
  description: string
  confidence: number         // 0-100
}

export interface ReasoningResult {
  query: string
  steps: ReasoningStep[]
  finalConclusion: string
  factAccuracy: number       // 0-100
}

// ── DEEP_REASONING 스트리밍 도중 파생되는 임시 객체 ──
export interface PartialThoughts {
  thoughts: string
  conclusion?: string
}

// 최종 정형 객체와 임시 객체의 유니온 타입
export type StreamingReasoning = ReasoningResult | PartialThoughts

// ── 타입 가드 함수 정의 ──
export function isReasoningResult(result: unknown): result is ReasoningResult {
  if (typeof result !== 'object' || result === null) return false
  const res = result as Record<string, unknown>
  return (
    'steps' in res &&
    Array.isArray(res.steps) &&
    'finalConclusion' in res &&
    'factAccuracy' in res
  )
}

export function isPartialThoughts(result: unknown): result is PartialThoughts {
  if (typeof result !== 'object' || result === null) return false
  const res = result as Record<string, unknown>
  return 'thoughts' in res && typeof res.thoughts === 'string'
}

/**
 * 💡 [대화창 오염 차단 핵심 가드]: 대화창 오류로 끝에 붙은 'canvas'나 노이즈 문자열을 제거하고
 * 첫 번째 '[' 또는 '{' 부터 마지막 ']' 또는 '}' 까지의 순수 JSON 문자열만 추출합니다.
 */
export function extractPureJson(rawText: string): string {
  let finalJson = rawText.trim()
  finalJson = finalJson.replace(/canvas[\s\S]*$/i, '').trim() // canvas 이후 쓰레기 텍스트 강제 절단

  const firstJsonIdx = Math.min(
    finalJson.indexOf('[') === -1 ? Infinity : finalJson.indexOf('['),
    finalJson.indexOf('{') === -1 ? Infinity : finalJson.indexOf('{')
  )
  const lastJsonIdx = Math.max(finalJson.lastIndexOf(']'), finalJson.lastIndexOf('}'))

  if (firstJsonIdx !== Infinity && lastJsonIdx !== -1 && lastJsonIdx > firstJsonIdx) {
    finalJson = finalJson.substring(firstJsonIdx, lastJsonIdx + 1)
  }
  return finalJson
}
