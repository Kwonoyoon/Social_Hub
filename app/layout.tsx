import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 뷰포트 설정
export const viewport = { 
  width: "device-width", 
  initialScale: 1,
  maximumScale: 1, // 모바일에서 의도치 않은 확대 방지
};

export const metadata: Metadata = {
  title: "KNOCK KNOCK",
  description: "취향 기반 소셜 허브 '낙낙'",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* [핵심 수정] 
       1. lang="ko"로 변경 (한국어 서비스 최적화)
       2. suppressHydrationWarning 추가 (브라우저 번역/확장 프로그램으로 인한 에러 방지)
    */
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        // body에도 추가해주면 더 안전합니다.x  
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}