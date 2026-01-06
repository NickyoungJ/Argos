/**
 * 모니터링 작업 함수
 */

import { inngest } from '../client'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { runMonitor } from '@/lib/scraper/monitor'
import type { Monitor, MonitorMode } from '@/lib/types/database'

/**
 * 단일 모니터 작업 실행
 */
export const monitorCheckJob = inngest.createFunction(
  {
    id: 'monitor-check',
    name: 'Monitor Check Job',
    retries: 2,
  },
  { event: 'monitor/check' },
  async ({ event, step }) => {
    const { monitorId } = event.data

    // Step 1: 모니터 정보 가져오기
    const monitor = await step.run('fetch-monitor', async () => {
      const supabase = createSupabaseAdminClient()
      const { data, error } = await supabase
        .from('monitors')
        .select('*')
        .eq('id', monitorId)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        throw new Error(`Monitor not found or inactive: ${monitorId}`)
      }

      return data as Monitor
    })

    // Step 2: 사용자 정보 가져오기 (크레딧 체크)
    const user = await step.run('fetch-user', async () => {
      const supabase = createSupabaseAdminClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', monitor.user_id)
        .single()

      if (error || !data) {
        throw new Error(`User not found: ${monitor.user_id}`)
      }

      return data
    })

    // Step 3: Semantic 모드인 경우 크레딧 체크
    if (monitor.mode === 'SEMANTIC') {
      if (user.credits <= 0) {
        // 크레딧 부족 - Visual 모드로 자동 전환
        await step.run('downgrade-to-visual', async () => {
          const supabase = createSupabaseAdminClient()
          await supabase
            .from('monitors')
            .update({ mode: 'VISUAL' })
            .eq('id', monitorId)
        })

        // Visual 모드로 재실행
        monitor.mode = 'VISUAL'
      }
    }

    // Step 4: 스크래핑 및 분석 실행
    const result = await step.run('run-monitor', async () => {
      // Visual 모드인 경우 이전 해시 가져오기
      let previousHash: string | undefined
      if (monitor.mode === 'VISUAL') {
        const supabase = createSupabaseAdminClient()
        const { data: lastLog } = await supabase
          .from('logs')
          .select('message')
          .eq('monitor_id', monitorId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (lastLog?.message?.startsWith('Hash:')) {
          previousHash = lastLog.message.replace('Hash: ', '')
        }
      }

      return await runMonitor(monitor.url, {
        mode: monitor.mode as MonitorMode,
        targetOption: monitor.target_option || undefined,
        targetSelector: monitor.target_selector || undefined,
        productName: monitor.product_name,
        previousHash,
      })
    })

    // Step 5: 크레딧 차감 (Semantic 모드)
    if (monitor.mode === 'SEMANTIC' && result.success) {
      await step.run('deduct-credit', async () => {
        const supabase = createSupabaseAdminClient()
        await supabase
          .from('users')
          .update({ credits: user.credits - 1 })
          .eq('id', monitor.user_id)
      })
    }

    // Step 6: 모니터 업데이트 (last_checked_at, fail_count)
    await step.run('update-monitor', async () => {
      const supabase = createSupabaseAdminClient()
      const updates: any = {
        last_checked_at: new Date().toISOString(),
      }

      if (result.success) {
        updates.fail_count = 0
      } else {
        updates.fail_count = monitor.fail_count + 1

        // 연속 5회 실패 시 비활성화
        if (updates.fail_count >= 5) {
          updates.is_active = false
        }
      }

      await supabase
        .from('monitors')
        .update(updates)
        .eq('id', monitorId)
    })

    // Step 7: 로그 저장
    await step.run('save-log', async () => {
      const supabase = createSupabaseAdminClient()
      
      let status: 'CHANGED' | 'UNCHANGED' | 'ERROR' = 'ERROR'
      let message = result.message

      if (result.success) {
        status = result.changed ? 'CHANGED' : 'UNCHANGED'
        
        // Visual 모드인 경우 해시 저장
        if (monitor.mode === 'VISUAL' && result.currentHash) {
          message = `Hash: ${result.currentHash}`
        }
      }

      await supabase.from('logs').insert({
        monitor_id: monitorId,
        status,
        message,
      })
    })

    // Step 8: 변화 감지 시 알림 트리거
    if (result.changed && result.success) {
      await step.sendEvent('trigger-notification', {
        name: 'notification/send',
        data: {
          userId: monitor.user_id,
          monitorId,
          productName: monitor.product_name,
          targetOption: monitor.target_option,
          url: monitor.url,
          data: result.data,
        },
      })
    }

    return {
      monitorId,
      success: result.success,
      changed: result.changed,
      message: result.message,
    }
  }
)

