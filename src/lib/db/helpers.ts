import { supabase } from '@/lib/supabase'
import { QuizQuestion } from '@/types/ai'

// 개념 요약 저장 인터페이스
interface SaveDigestParams {
    userId: string
    title: string
    bullets: string[]
    keywords: string[]
    originalContent?: string
}

interface WrongAnswerItem extends QuizQuestion {
    userSelectedIdx: number;
}

// 퀴즈 결과 및 오답 데이터 저장 인터페이스
interface SaveQuizLogParams {
    userId: string
    topic: string
    totalQuestions: number
    correctCount: number
    scorePercentage: number
    wrongAnswers: WrongAnswerItem[] // 틀린 문제들의 메타데이터 객체 배열
}

/**
 * 💡 [개념 요약 모드] AI가 생성한 요약 리포트를 유저 보관함에 저장
 */
export async function saveLearningDigest({
    userId,
    title,
    bullets,
    keywords,
    originalContent = ''
}: SaveDigestParams) {
    const { data, error } = await supabase
        .from('learning_digests')
        .insert([
            {
                user_id: userId,
                title,
                bullets,
                keywords,
                original_content: originalContent
            }
        ])
        .select()

    if (error) {
        console.error('❌ saveLearningDigest Error:', error.message)
        throw error
    }
    return data
}

/**
 * 📝 [퀴즈 생성 모드] 풀이가 완료된 퀴즈 점수 및 오답 리스트를 오답노트에 저장
 */
export async function saveQuizLog({
    userId,
    topic,
    totalQuestions,
    correctCount,
    scorePercentage,
    wrongAnswers
}: SaveQuizLogParams) {
    const { data, error } = await supabase
        .from('quiz_logs')
        .insert([
            {
                user_id: userId,
                topic,
                total_questions: totalQuestions,
                correct_count: correctCount,
                score_percentage: scorePercentage,
                wrong_answers: wrongAnswers
            }
        ])
        .select()

    if (error) {
        console.error('❌ saveQuizLog Error:', error.message)
        throw error
    }
    return data
}

/**
 * 📚 [오답노트 / 보관함 탭] 유저가 저장한 모든 요약 및 오답노트 히스토리를 쿼리
 */
export async function getUserLearningHistory(userId: string) {
    // 요약 보관함 리스트 조회
    const digestsPromise = supabase
        .from('learning_digests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    // 퀴즈 및 오답 기록 리스트 조회
    const quizLogsPromise = supabase
        .from('quiz_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    const [digestsRes, quizLogsRes] = await Promise.all([digestsPromise, quizLogsPromise])

    if (digestsRes.error) throw digestsRes.error
    if (quizLogsRes.error) throw quizLogsRes.error

    return {
        savedDigests: digestsRes.data,
        quizHistory: quizLogsRes.data
    }
}