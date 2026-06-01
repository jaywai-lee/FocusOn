import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "FocusOn | 초개인화 AI 학습 보조 플랫폼",
  description: "연령 및 성별 기반 도메인 컨텍스트 포커싱 기술과 다이내믹 디자인 토큰 시스템으로 맞춤형 AI 학습 경험을 제공합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}


