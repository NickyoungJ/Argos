/**
 * 모니터 CRUD API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { validateMonitorCreation } from '@/lib/quota/checker'
import { triggerMonitorCheck } from '@/lib/inngest/trigger'
import type { MonitorMode } from '@/lib/types/database'

/**
 * GET /api/monitors - 사용자의 모니터 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증되지 않았습니다' }, { status: 401 })
    }

    // 모니터 목록 조회
    const { data: monitors, error } = await supabase
      .from('monitors')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ monitors })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/monitors - 새 모니터 생성
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증되지 않았습니다' }, { status: 401 })
    }

    // 사용자 정보 및 현재 모니터 개수 조회
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: '사용자 정보를 찾을 수 없습니다' }, { status: 404 })
    }

    const { count: currentMonitorCount } = await supabase
      .from('monitors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // 요청 body 파싱
    const body = await request.json()
    const { url, product_name, target_option, target_selector, mode, frequency } = body

    // 필수 필드 검증
    if (!url || !product_name || !mode || !frequency) {
      return NextResponse.json(
        { error: 'url, product_name, mode, frequency는 필수입니다' },
        { status: 400 }
      )
    }

    // URL 형식 검증
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: '유효한 URL이 아닙니다' }, { status: 400 })
    }

    // 요금제별 제한 검증
    const validation = validateMonitorCreation({
      tier: userProfile.tier,
      currentMonitorCount: currentMonitorCount || 0,
      frequency: parseInt(frequency),
      mode: mode as MonitorMode,
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 403 }
      )
    }

    // 모니터 생성
    const { data: monitor, error: createError } = await supabase
      .from('monitors')
      .insert({
        user_id: user.id,
        url,
        product_name,
        target_option: target_option || null,
        target_selector: target_selector || null,
        mode,
        frequency: parseInt(frequency),
        is_active: true,
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // 즉시 첫 체크 트리거
    await triggerMonitorCheck(monitor.id)

    return NextResponse.json({ monitor }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

