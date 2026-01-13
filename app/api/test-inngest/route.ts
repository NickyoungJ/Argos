import { inngest } from '@/lib/inngest/client'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // 테스트 이벤트 발송
    await inngest.send({
      name: 'test/event',
      data: {
        message: 'Inngest 연동 테스트',
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Inngest 이벤트가 성공적으로 발송되었습니다.'
    })
  } catch (error) {
    console.error('Inngest 이벤트 발송 실패:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
