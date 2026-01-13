/**
 * 임시 Admin API - 사용자 티어 업그레이드
 * 실제 프로덕션에서는 적절한 인증/권한 체크 필요
 */

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, tier } = await request.json()

    if (!email || !tier) {
      return NextResponse.json(
        { error: 'email과 tier가 필요합니다' },
        { status: 400 }
      )
    }

    // 유효한 티어 체크 (대문자로 변환)
    const tierUpper = tier.toUpperCase()
    const validTiers = ['FREE', 'STANDARD', 'PRO']
    if (!validTiers.includes(tierUpper)) {
      return NextResponse.json(
        { error: `tier는 ${validTiers.join(', ')} 중 하나여야 합니다` },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // 사용자 확인
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, tier')
      .eq('email', email)
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 티어 업데이트 (대문자로)
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ tier: tierUpper })
      .eq('email', email)
      .select('id, email, tier')
      .single()

    if (updateError) {
      console.error('Tier update error:', updateError)
      return NextResponse.json(
        { error: '티어 업데이트 실패', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${email} 사용자를 ${tier} 티어로 업그레이드했습니다`,
      before: { tier: user.tier },
      after: { tier: updated.tier }
    })
  } catch (error) {
    console.error('Upgrade user error:', error)
    return NextResponse.json(
      { error: '서버 오류', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
