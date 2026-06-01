import { FocusModeType } from '@/lib/supabase'

// ────────────────────────────────────────────────
// 공용 타입 정의
// ────────────────────────────────────────────────

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

// ────────────────────────────────────────────────
// 모드별 System Prompt 템플릿
// ────────────────────────────────────────────────

export const SYSTEM_PROMPTS: Record<FocusModeType, string> = {

  FAST_DIGEST: `
당신은 초고속 핵심 요약 전문 AI입니다.
입력된 학습 자료를 분석하여 아래 규칙을 엄격히 준수해 주세요.

[출력 규칙]
- 불필요한 수식어, 반복 문장, 배경 설명을 모두 제거하세요.
- 핵심 개념을 3~5개의 명료한 불릿 포인트로 정리하세요.
- 반드시 **Markdown** 형식으로 출력하세요.
- 중요 키워드는 반드시 **볼드체**로 강조하세요.
- 응답 전체 길이는 300자를 초과하지 않도록 하세요.

[출력 포맷]
## {제목}
- {핵심 요점 1}
- {핵심 요점 2}
- {핵심 요점 3}

**핵심 키워드:** {키워드1}, {키워드2}, {키워드3}
  `.trim(),

  QUIZ_BUILDER: `
당신은 인터랙티브 학습 퀴즈 생성 전문 AI입니다.
입력된 학습 자료를 분석하여 아래 규칙을 엄격히 준수해 주세요.

[출력 규칙]
- 반드시 유효한 **JSON Array** 형식만 출력하세요. 다른 텍스트는 절대 포함하지 마세요.
- 문제는 3~5개를 생성하고 각 문제는 4개의 보기를 포함해야 합니다.
- 각 문제마다 correctIdx(0-based)와 explanation을 반드시 포함하세요.
- difficulty는 'easy' | 'medium' | 'hard' 중 하나를 선택하세요.

[출력 포맷 - JSON Array]
[
  {
    "id": "q1",
    "question": "문제 내용",
    "options": ["보기1", "보기2", "보기3", "보기4"],
    "correctIdx": 0,
    "explanation": "해설 내용",
    "difficulty": "medium",
    "topic": "핵심 주제"
  }
]
  `.trim(),

  DEEP_REASONING: `
당신은 논리적 심층 추론 전문 AI입니다.
입력된 학습 자료를 분석하여 단계별 Chain of Thought(CoT) 사고 과정을 시각화하세요.

[출력 규칙]
- 반드시 유효한 **JSON 객체** 형식만 출력하세요.
- 추론은 반드시 3단계로 구성하세요: 스캔 → 검증 → 결론
- 각 단계마다 confidence(신뢰도 %)를 0~100 사이 숫자로 표시하세요.
- factAccuracy(최종 팩트 정확도)를 전체 결론과 함께 제공하세요.
- 각 단계의 description은 100~150자 수준으로 구체적으로 서술하세요.

[출력 포맷 - JSON Object]
{
  "query": "분석 대상 질의",
  "steps": [
    {
      "id": "step-1",
      "phase": "스캔",
      "title": "1단계: 문맥 스캔 및 핵심 논점 추출",
      "description": "단계별 추론 설명",
      "confidence": 85
    },
    {
      "id": "step-2",
      "phase": "검증",
      "title": "2단계: 논리적 모순 검증 및 팩트 체크",
      "description": "단계별 추론 설명",
      "confidence": 92
    },
    {
      "id": "step-3",
      "phase": "결론",
      "title": "3단계: 반론 처리 및 최종 결론 도출",
      "description": "단계별 추론 설명",
      "confidence": 98
    }
  ],
  "finalConclusion": "종합 결론 요약",
  "factAccuracy": 97
}
  `.trim(),
}

// ────────────────────────────────────────────────
// 모드별 User Prompt 생성기 (동적 컨텍스트 삽입)
// ────────────────────────────────────────────────

export function buildUserPrompt(mode: FocusModeType, content: string): string {
  switch (mode) {
    case 'FAST_DIGEST':
      return `다음 학습 자료를 분석하여 초고속 핵심 요약을 생성해주세요:\n\n${content}`
    case 'QUIZ_BUILDER':
      return `다음 학습 자료를 분석하여 JSON 형식의 퀴즈를 생성해주세요:\n\n${content}`
    case 'DEEP_REASONING':
      return `다음 학습 자료를 심층적으로 분석하여 CoT 추론 과정을 JSON으로 제공해주세요:\n\n${content}`
  }
}

// ────────────────────────────────────────────────
// 모드별 Mock 데이터 (AI 연동 전 UI 개발용)
// ────────────────────────────────────────────────

export const MOCK_DIGEST: DigestSummary = {
  title: 'HTTP/3 프로토콜 핵심 아키텍처',
  bullets: [
    '기존 **TCP** 대신 UDP 기반의 **QUIC 프로토콜**을 사용해 패킷 핸드셰이크 지연을 획기적으로 개선함.',
    'HTTP/2의 고질적 한계였던 **Head-of-Line Blocking** 문제를 스트림 분리 독립화로 완전 해결함.',
    '클라이언트 IP 변경 시에도 **Connection ID** 기반으로 세션을 매끄럽게 승계하여 끊김 없는 연결을 보장함.',
  ],
  keywords: ['HTTP/3', 'QUIC', 'UDP', 'Connection ID', 'HOL Blocking'],
  readingTime: '읽는 데 약 1분',
}

export const MOCK_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    question: '다음 중 RESTful API 설계 원칙에 대한 설명으로 올바르지 않은 것은 무엇인가요?',
    options: [
      'Stateless(무상태성)를 유지하여 서버가 클라이언트 상태 정보를 저장하지 않는다.',
      'URI는 자원(Resource)을 표현해야 하며, 동사보다는 명사 형식을 사용한다.',
      'HTTP Method를 통해 자원에 대한 행위를 명확히 규정한다.',
      '항상 세션을 강제 동기화하여 서버 부하 분산을 전적으로 차단해야 한다.',
    ],
    correctIdx: 3,
    explanation:
      'REST API는 Stateless 원칙에 의해 서버가 클라이언트 세션 상태를 보관하지 않아야 합니다. 세션을 강제 동기화하는 방식은 REST 설계 원칙에 정면으로 위배됩니다.',
    difficulty: 'medium',
    topic: 'RESTful API',
  },
  {
    id: 'q2',
    question: 'HTTP/3에서 기존 TCP 대신 사용하는 전송 계층 프로토콜은 무엇인가요?',
    options: ['WebSocket', 'UDP 기반 QUIC', 'gRPC', 'SCTP'],
    correctIdx: 1,
    explanation:
      'HTTP/3는 TCP의 handshake 지연과 HOL Blocking 문제를 극복하기 위해 UDP 기반의 QUIC 프로토콜을 전송 계층으로 채택했습니다.',
    difficulty: 'easy',
    topic: 'HTTP/3 & QUIC',
  },
]

export const MOCK_REASONING: ReasoningResult = {
  query: 'HTTP/3의 QUIC 프로토콜이 기존 TCP 대비 성능 우위를 갖는 핵심 근거를 논증하라.',
  steps: [
    {
      id: 'step-1',
      phase: '스캔',
      title: '1단계: 문맥 스캔 및 핵심 논점 추출',
      description:
        '입력 문서 내 TCP와 QUIC의 연결 수립 방식 차이, 패킷 손실 복구 메커니즘, 그리고 멀티플렉싱 구현 구조의 차이점을 핵심 논점으로 식별했습니다. 총 3개의 비교 축을 기준으로 분석 트리를 구성합니다.',
      confidence: 88,
    },
    {
      id: 'step-2',
      phase: '검증',
      title: '2단계: RFC 기술 표준 교차 검증',
      description:
        'RFC 9000(QUIC)과 RFC 7540(HTTP/2) 명세를 교차 검증한 결과, QUIC의 0-RTT 연결 수립과 독립 스트림 설계가 실제로 TCP 기반 환경 대비 지연을 최대 30% 단축한다는 실증 데이터를 확인했습니다. 허위 주장 0건 감지.',
      confidence: 95,
    },
    {
      id: 'step-3',
      phase: '결론',
      title: '3단계: 반론 처리 및 최종 결론 도출',
      description:
        'UDP 기반이라 신뢰성이 낮다는 반론은 QUIC의 자체적인 패킷 재전송 및 흐름 제어 메커니즘이 내장되어 있어 TCP와 동등한 신뢰성을 보장함으로써 기각됩니다. 결론적으로 QUIC은 TCP보다 구조적으로 우위에 있습니다.',
      confidence: 98,
    },
  ],
  finalConclusion:
    'QUIC은 0-RTT 핸드셰이크, 독립 스트림 멀티플렉싱, 내장 암호화(TLS 1.3)를 통해 TCP 대비 연결 지연과 HOL Blocking 문제를 구조적으로 해소하여 HTTP/3의 핵심 전송 계층으로서 타당성이 충분히 증명됩니다.',
  factAccuracy: 97,
}
