import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPTS, buildUserPrompt } from '@/lib/ai/prompts'
import { FocusModeType, supabase } from '@/lib/supabase'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
    // ── [인증 가드]: 쿠키 세션 검증 ──
    const accessToken = req.cookies.get('sb-access-token')?.value
    if (!accessToken) {
        return NextResponse.json(
            { error: 'Unauthorized', details: '인증되지 않은 요청입니다. 로그인 후 이용해 주세요.' },
            { status: 401 }
        )
    }

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !authUser) {
        return NextResponse.json(
            { error: 'Unauthorized', details: '세션이 만료되었거나 유효하지 않습니다. 다시 로그인해 주세요.' },
            { status: 401 }
        )
    }

    try {
        const { content, focusMode } = await req.json() as { content: string; focusMode: FocusModeType }

        if (!content) {
            return NextResponse.json({ error: '분석할 학습 자료가 누락되었습니다.' }, { status: 400 })
        }
        if (!focusMode || !SYSTEM_PROMPTS[focusMode]) {
            return NextResponse.json({ error: '올바르지 않은 AI 포커싱 모드입니다.' }, { status: 400 })
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: '서버 환경 변수에 구글 API 키가 누락되었습니다.' }, { status: 500 })
        }

        // 💡 가속 팁: 퀴즈 빌더일 때 AI에게 JSON 형식으로 말하되, 포맷 검사(MimeType)로 시간 끌지 말라고 프롬프트 뒤에 덧붙임
        let systemPrompt = SYSTEM_PROMPTS[focusMode]
        if (focusMode === 'QUIZ_BUILDER') {
            systemPrompt += '\n\n정형화된 JSON 데이터 배열 스펙 외에 어떠한 인사말이나 마크다운 래퍼(```json)도 절대 출력하지 말고 오직 순수 텍스트 배열만 즉시 반환하세요.'
        }

        const userPrompt = buildUserPrompt(focusMode, content)

        let temperature = 0.4
        if (focusMode === 'QUIZ_BUILDER') temperature = 0.1
        if (focusMode === 'DEEP_REASONING') temperature = 0.7

        // 🚨 [가속 코어 스위칭]: 연산이 무거운 3.5 대신, 스트리밍 릴리즈 속도가 가장 빠른 gemini-2.5-flash 모델로 변경
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`

        const requestBody = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: `[시스템 지침]\n${systemPrompt}\n\n[학습 자료 및 요청]\n${userPrompt}` }]
                }
            ],
            generationConfig: {
                temperature,
                // 💡 application/json 옵션을 끄면 구글 서버 내부 버퍼링이 사라져 첫 글자가 즉시 출력됩니다.
            }
        }

        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        })

        if (!googleResponse.ok) {
            const errText = await googleResponse.text()
            let parsedErr
            try { parsedErr = JSON.parse(errText) } catch { parsedErr = { error: { message: errText } } }

            const customMessage = parsedErr?.error?.code === 503
                ? '현재 구글 AI 트래픽이 폭주하여 서비스를 일시적으로 이용할 수 없습니다. 잠시 후 다시 시도해 주세요.'
                : `Google API 통신 실패: ${parsedErr?.error?.message || errText}`

            return NextResponse.json({ error: 'AI 분석 처리 실패', details: customMessage }, { status: googleResponse.status })
        }

        const responseStream = googleResponse.body
        if (!responseStream) throw new Error('구글 응답 바디가 비어있습니다.')

        const reader = responseStream.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let buffer = ''
                    while (true) {
                        const { value, done } = await reader.read()
                        if (done) break

                        buffer += decoder.decode(value, { stream: true })
                        const lines = buffer.split('\n')
                        buffer = lines.pop() || ''

                        for (const line of lines) {
                            const cleanLine = line.trim()
                            if (!cleanLine || !cleanLine.startsWith('data:')) continue

                            try {
                                const jsonStr = cleanLine.replace(/^data:\s*/, '').trim()
                                if (jsonStr.includes('[DONE]') || jsonStr === '') continue

                                const parsed = JSON.parse(jsonStr)
                                const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text
                                if (textChunk) {
                                    controller.enqueue(encoder.encode(textChunk))
                                }
                            } catch {
                                // 불완전 청크 캐리 오버
                            }
                        }
                    }
                    controller.close()
                } catch (streamError) {
                    controller.error(streamError)
                }
            }
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache, no-transform',
            },
        })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 내부 서버 예외'
        console.error('❌ Native Pure Fetch Route Error:', error)
        return NextResponse.json({ error: 'AI 분석을 처리하는 과정에서 런타임 예외가 발생했습니다.', details: errorMessage }, { status: 500 })
    }
}