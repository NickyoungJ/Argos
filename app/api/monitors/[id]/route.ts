/**
 * 개별 모니터 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { validateMonitorCreation } from '@/lib/quota/checker'
import type { MonitorMode } from '@/lib/types/database'

/**
 * GET /api/monitors/[id] - 모니터 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증되지 않았습니다' }, { status: 401 })
    }

    const { data: monitor, error } = await supabase
      .from('monitors')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !monitor) {
      return NextResponse.json({ error: '모니터를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ monitor })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PATCH /api/monitors/[id] - 모니터 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증되지 않았습니다' }, { status: 401 })
    }

    // 기존 모니터 조회
    const { data: existingMonitor, error: fetchError } = await supabase
      .from('monitors')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingMonitor) {
      return NextResponse.json({ error: '모니터를 찾을 수 없습니다' }, { status: 404 })
    }

    const body = await request.json()
    const updates: any = {}

    // 업데이트할 필드만 추출
    if (body.url !== undefined) updates.url = body.url
    if (body.product_name !== undefined) updates.product_name = body.product_name
    if (body.target_option !== undefined) updates.target_option = body.target_option
    if (body.target_selector !== undefined) updates.target_selector = body.target_selector
    if (body.is_active !== undefined) updates.is_active = body.is_active
    if (body.mode !== undefined) updates.mode = body.mode
    if (body.frequency !== undefined) updates.frequency = parseInt(body.frequency)

    // mode나 frequency 변경 시 권한 체크
    if (updates.mode || updates.frequency) {
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

      const validation = validateMonitorCreation({
        tier: userProfile.tier,
        currentMonitorCount: (currentMonitorCount || 0) - 1, // 현재 수정 중인 모니터 제외
        frequency: updates.frequency || existingMonitor.frequency,
        mode: updates.mode || existingMonitor.mode,
      })

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.errors.join(', ') },
          { status: 403 }
        )
      }
    }

    // 업데이트 실행
    const { data: monitor, error: updateError } = await supabase
      .from('monitors')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ monitor })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/monitors/[id] - 모니터 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증되지 않았습니다' }, { status: 401 })
    }

    const { error } = await supabase
      .from('monitors')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

