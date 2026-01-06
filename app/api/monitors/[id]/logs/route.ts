/**
 * 모니터 로그 조회 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * GET /api/monitors/[id]/logs - 모니터의 로그 조회
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

    // 모니터 소유권 확인
    const { data: monitor } = await supabase
      .from('monitors')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!monitor) {
      return NextResponse.json({ error: '모니터를 찾을 수 없습니다' }, { status: 404 })
    }

    // 쿼리 파라미터
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 로그 조회
    const { data: logs, error, count } = await supabase
      .from('logs')
      .select('*', { count: 'exact' })
      .eq('monitor_id', params.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      logs,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

