/**
 * 스크래퍼 테스트 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { runMonitor } from '@/lib/scraper/monitor'
import type { MonitorMode } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, mode, targetOption, productName } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL이 필요합니다' },
        { status: 400 }
      )
    }

    if (!mode || !['VISUAL', 'SEMANTIC'].includes(mode)) {
      return NextResponse.json(
        { error: '유효한 모드를 선택하세요 (VISUAL 또는 SEMANTIC)' },
        { status: 400 }
      )
    }

    // 모니터링 실행
    const result = await runMonitor(url, {
      mode: mode as MonitorMode,
      targetOption,
      productName,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '서버 오류' },
      { status: 500 }
    )
  }
}

