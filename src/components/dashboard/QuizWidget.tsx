'use client'

import React, { useState } from 'react'
import { CheckCircle2, XCircle, FileQuestion, RotateCcw, ChevronRight } from 'lucide-react'
import { QuizQuestion } from '@/lib/ai/prompts'

interface QuizWidgetProps {
  questions: QuizQuestion[]
}

interface AnswerState {
  selected: number | null
  submitted: boolean
}

export default function QuizWidget({ questions }: QuizWidgetProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(
    Object.fromEntries(questions.map((q) => [q.id, { selected: null, submitted: false }]))
  )
  const [quizFinished, setQuizFinished] = useState(false)

  const currentQuestion = questions[currentIdx]
  const currentAnswer = answers[currentQuestion.id]

  const isCorrect =
    currentAnswer.submitted && currentAnswer.selected === currentQuestion.correctIdx

  const totalCorrect = questions.filter((q) => {
    const a = answers[q.id]
    return a.submitted && a.selected === q.correctIdx
  }).length

  // 선택지 선택 핸들러
  const handleSelect = (idx: number) => {
    if (currentAnswer.submitted) return
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], selected: idx },
    }))
  }

  // 답안 제출 핸들러
  const handleSubmit = () => {
    if (currentAnswer.selected === null) return
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], submitted: true },
    }))
  }

  // 다음 문제로 이동
  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1)
    } else {
      setQuizFinished(true)
    }
  }

  // 퀴즈 초기화
  const handleReset = () => {
    setCurrentIdx(0)
    setQuizFinished(false)
    setAnswers(
      Object.fromEntries(questions.map((q) => [q.id, { selected: null, submitted: false }]))
    )
  }

  const difficultyBadge: Record<QuizQuestion['difficulty'], string> = {
    easy: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    hard: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  }
  const difficultyLabel: Record<QuizQuestion['difficulty'], string> = {
    easy: '기초',
    medium: '응용',
    hard: '심화',
  }

  // ── 최종 결과 화면 ──
  if (quizFinished) {
    const percent = Math.round((totalCorrect / questions.length) * 100)
    const grade = percent >= 80 ? '우수' : percent >= 60 ? '양호' : '분발 필요'
    return (
      <div className="bg-card border border-primary/20 rounded-2xl p-6 shadow-xs space-y-5 transition-colors duration-300">
        <div className="text-center space-y-3 py-4">
          <div className="text-5xl">{percent >= 80 ? '🎉' : percent >= 60 ? '👍' : '📚'}</div>
          <h3 className="text-xl font-bold tracking-tight">평가 완료</h3>
          <div className="flex items-center justify-center gap-2 text-4xl font-black text-primary transition-colors duration-300">
            {totalCorrect}
            <span className="text-lg font-semibold text-muted-foreground">/ {questions.length}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            정답률 <span className="font-bold text-foreground">{percent}%</span> · 등급:{' '}
            <span className="font-bold text-primary transition-colors duration-300">{grade}</span>
          </div>

          {/* 진행 바 */}
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 bg-primary rounded-full transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* 문항별 결과 요약 */}
        <div className="space-y-2">
          {questions.map((q, idx) => {
            const a = answers[q.id]
            const correct = a.selected === q.correctIdx
            return (
              <div
                key={q.id}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-xs transition-colors duration-200 ${
                  correct
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-rose-500/5 border-rose-500/20'
                }`}
              >
                {correct ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                )}
                <span className="font-semibold leading-relaxed">
                  Q{idx + 1}. {q.question}
                </span>
              </div>
            )
          })}
        </div>

        <button
          onClick={handleReset}
          className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          다시 풀기
        </button>
      </div>
    )
  }

  // ── 문제 풀이 화면 ──
  return (
    <div className="bg-card border border-primary/20 rounded-2xl p-6 shadow-xs space-y-5 transition-colors duration-300">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-indigo-500" />
          <h3 className="font-bold text-sm tracking-tight">인터랙티브 AI 평가</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
              difficultyBadge[currentQuestion.difficulty]
            }`}
          >
            {difficultyLabel[currentQuestion.difficulty]}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold">
            {currentIdx + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
        <div
          className="h-1 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 주제 태그 */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 transition-colors duration-300">
          #{currentQuestion.topic}
        </span>
      </div>

      {/* 문제 */}
      <p className="text-[14px] font-bold leading-relaxed">{currentQuestion.question}</p>

      {/* 선택지 */}
      <div className="flex flex-col gap-2">
        {currentQuestion.options.map((opt, idx) => {
          const isSelected = currentAnswer.selected === idx
          const isSubmitted = currentAnswer.submitted
          const isCorrectOption = idx === currentQuestion.correctIdx
          const isWrongChoice = isSubmitted && isSelected && !isCorrectOption

          let optClass =
            'bg-card border-border hover:bg-primary/5 hover:border-primary'
          if (!isSubmitted && isSelected) {
            optClass = 'bg-primary/10 border-primary text-primary'
          } else if (isSubmitted && isCorrectOption) {
            optClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
          } else if (isWrongChoice) {
            optClass = 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300'
          }

          return (
            <button
              key={idx}
              disabled={isSubmitted}
              onClick={() => handleSelect(idx)}
              className={`text-left px-4 py-3.5 rounded-xl border text-[13px] font-semibold transition-all cursor-pointer flex items-start gap-3 ${optClass}`}
            >
              <span className="font-mono text-xs shrink-0 mt-0.5 opacity-60">({idx + 1})</span>
              <span className="flex-1 leading-snug">{opt}</span>
              {isSubmitted && isCorrectOption && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              )}
              {isWrongChoice && (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {/* 해설 패널 (제출 후 노출) */}
      {currentAnswer.submitted && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed transition-all duration-300 ${
            isCorrect
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-rose-500/10 border-rose-500/20'
          }`}
        >
          <h4 className="font-bold text-[13px] flex items-center gap-1.5 mb-1.5">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-700 dark:text-emerald-300">정답입니다!</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-500" />
                <span className="text-rose-700 dark:text-rose-300">오답입니다.</span>
              </>
            )}
          </h4>
          <p className="text-muted-foreground leading-relaxed">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      {!currentAnswer.submitted ? (
        <button
          onClick={handleSubmit}
          disabled={currentAnswer.selected === null}
          className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-bold text-xs rounded-xl transition-all duration-300 cursor-pointer"
        >
          정답 제출하기
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
        >
          {currentIdx < questions.length - 1 ? (
            <>
              다음 문제
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          ) : (
            '결과 보기'
          )}
        </button>
      )}
    </div>
  )
}
