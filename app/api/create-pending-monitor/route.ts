/**
 * 로그인 후 pending 모니터 생성 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { triggerMonitorCheck } from '@/lib/inngest/trigger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증되지 않았습니다' }, { status: 401 })
    }

    const body = await request.json()
    const { url, product_name, target_option, mode, frequency } = body

    // 모니터 생성
    const { data: monitor, error: createError } = await supabase
      .from('monitors')
      .insert({
        user_id: user.id,
        url,
        product_name,
        target_option: target_option || null,
        mode,
        frequency,
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

