/**
 * 알림 테스트 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendNotification } from '@/lib/notification/sender'
import type { NotificationData } from '@/lib/notification/templates'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, phoneNumber, tier } = body

    if (!email || !tier) {
      return NextResponse.json(
        { error: 'email과 tier는 필수입니다' },
        { status: 400 }
      )
    }

    // 테스트 알림 데이터
    const testData: NotificationData = {
      productName: '테스트 상품 - 나이키 에어맥스',
      targetOption: '사이즈 270',
      url: 'https://example.com/product/test',
      price: 159000,
      timestamp: new Date().toLocaleString('ko-KR'),
    }

    // 알림 발송
    const result = await sendNotification({
      to: {
        email,
        phoneNumber: phoneNumber || undefined,
      },
      tier,
      data: testData,
    })

    return NextResponse.json({
      success: result.success,
      finalChannel: result.finalChannel,
      channels: result.channels,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '서버 오류' },
      { status: 500 }
    )
  }
}

