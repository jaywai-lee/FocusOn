-- 1. 사용자 프로필 테이블 (기존 users 테이블 확장)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 개념 요약 보관함 테이블 (Bookmarking / History)
CREATE TABLE public.learning_digests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    bullets TEXT[] NOT NULL, -- 요약 불릿 포인트 배열 저장
    keywords TEXT[] NOT NULL, -- 추출된 핵심 태그 배열 저장
    original_content TEXT, -- 원본 데이터 백업
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 퀴즈 히스토리 및 오답노트 테이블
CREATE TABLE public.quiz_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    topic TEXT NOT NULL,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    score_percentage INT NOT NULL,
    wrong_answers JSONB NOT NULL, -- 틀린 문제의 { question, options, selected, correctIdx, explanation } 정형 데이터 통째로 저장
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS (Row Level Security) 설정 - 유저 본인의 데이터만 조회/수정 가능하도록 방어
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can manage own digests" ON public.learning_digests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quiz logs" ON public.quiz_logs FOR ALL USING (auth.uid() = user_id);