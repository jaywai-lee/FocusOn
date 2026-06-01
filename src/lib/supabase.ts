import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key'

// Supabase 클라이언트 초기화
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 3대 핵심 AI 특화 모드 타입 정의
export type FocusModeType = 'FAST_DIGEST' | 'QUIZ_BUILDER' | 'DEEP_REASONING'

// 가상 유저 프로필 데이터 구조 정의 (users 테이블 구조 매핑 + focusMode 포함)
export interface UserProfile {
  id: string
  email: string
  age: number
  gender: 'male' | 'female' | 'other'
  focusMode: FocusModeType
  created_at: string
}

// 3대 AI 학습 모드를 대표하는 시뮬레이션용 유저 세션 데이터 풀
export const MOCK_USER_SESSIONS: Record<'fastDigest' | 'quizBuilder' | 'deepReasoning', UserProfile> = {
  fastDigest: {
    id: 'user-digest-uuid',
    email: 'fast_learner@focuson.ai',
    age: 24,
    gender: 'female',
    focusMode: 'FAST_DIGEST',
    created_at: '2026-06-01T00:00:00.000Z',
  },
  quizBuilder: {
    id: 'user-quiz-uuid',
    email: 'quiz_challenger@focuson.ai',
    age: 18,
    gender: 'male',
    focusMode: 'QUIZ_BUILDER',
    created_at: '2026-06-01T00:00:00.000Z',
  },
  deepReasoning: {
    id: 'user-reasoning-uuid',
    email: 'deep_philosopher@focuson.ai',
    age: 29,
    gender: 'other',
    focusMode: 'DEEP_REASONING',
    created_at: '2026-06-01T00:00:00.000Z',
  },
}
