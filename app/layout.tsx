import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NoMoreF5 - 재입고 알림 서비스",
  description: "F5 새로고침은 그만! AI 기반 실시간 모니터링으로 품절 상품의 재입고를 가장 빠르게 알려드립니다",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

