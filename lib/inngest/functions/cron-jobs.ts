/**
 * Cron 작업 - 주기적으로 모니터 체크
 */

import { inngest } from '../client'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

/**
 * 1분마다 실행 - Pro 티어 모니터 체크
 */
export const cronEveryMinute = inngest.createFunction(
  {
    id: 'cron-every-minute',
    name: 'Check monitors every minute (Pro)',
  },
  { cron: '* * * * *' }, // 매 1분
  async ({ step }) => {
    const monitors = await step.run('fetch-pro-monitors', async () => {
      const supabase = createSupabaseAdminClient()
      
      // Pro 티어 사용자의 활성 모니터 중 frequency가 1분인 것
      const { data, error } = await supabase
        .from('monitors')
        .select(`
          id,
          user_id,
          frequency,
          last_checked_at,
          users!inner (tier)
        `)
        .eq('is_active', true)
        .eq('frequency', 1)
        .eq('users.tier', 'PRO')

      if (error) {
        console.error('Error fetching monitors:', error)
        return []
      }

      return data || []
    })

    // 각 모니터에 대해 체크 이벤트 발생
    const events = monitors.map((monitor: any) => ({
      name: 'monitor/check',
      data: { monitorId: monitor.id },
    }))

    if (events.length > 0) {
      await step.sendEvent('trigger-checks', events)
    }

    return { checked: events.length }
  }
)

/**
 * 5분마다 실행 - Standard 티어 모니터 체크
 */
export const cronEveryFiveMinutes = inngest.createFunction(
  {
    id: 'cron-every-5-minutes',
    name: 'Check monitors every 5 minutes (Standard)',
  },
  { cron: '*/5 * * * *' }, // 매 5분
  async ({ step }) => {
    const monitors = await step.run('fetch-standard-monitors', async () => {
      const supabase = createSupabaseAdminClient()
      
      const { data, error } = await supabase
        .from('monitors')
        .select(`
          id,
          user_id,
          frequency,
          last_checked_at,
          users!inner (tier)
        `)
        .eq('is_active', true)
        .eq('frequency', 5)
        .eq('users.tier', 'STANDARD')

      if (error) {
        console.error('Error fetching monitors:', error)
        return []
      }

      return data || []
    })

    const events = monitors.map((monitor: any) => ({
      name: 'monitor/check',
      data: { monitorId: monitor.id },
    }))

    if (events.length > 0) {
      await step.sendEvent('trigger-checks', events)
    }

    return { checked: events.length }
  }
)

/**
 * 30분마다 실행 - Free 티어 모니터 체크
 */
export const cronEveryThirtyMinutes = inngest.createFunction(
  {
    id: 'cron-every-30-minutes',
    name: 'Check monitors every 30 minutes (Free)',
  },
  { cron: '*/30 * * * *' }, // 매 30분
  async ({ step }) => {
    const monitors = await step.run('fetch-free-monitors', async () => {
      const supabase = createSupabaseAdminClient()
      
      const { data, error } = await supabase
        .from('monitors')
        .select(`
          id,
          user_id,
          frequency,
          last_checked_at,
          users!inner (tier)
        `)
        .eq('is_active', true)
        .eq('frequency', 30)
        .eq('users.tier', 'FREE')

      if (error) {
        console.error('Error fetching monitors:', error)
        return []
      }

      return data || []
    })

    const events = monitors.map((monitor: any) => ({
      name: 'monitor/check',
      data: { monitorId: monitor.id },
    }))

    if (events.length > 0) {
      await step.sendEvent('trigger-checks', events)
    }

    return { checked: events.length }
  }
)

/**
 * 매일 자정 - 정리 작업
 */
export const cronDailyCleanup = inngest.createFunction(
  {
    id: 'cron-daily-cleanup',
    name: 'Daily cleanup and maintenance',
  },
  { cron: '0 0 * * *' }, // 매일 00:00
  async ({ step }) => {
    // 30일 이상 된 로그 삭제
    await step.run('cleanup-old-logs', async () => {
      const supabase = createSupabaseAdminClient()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      await supabase
        .from('logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
    })

    // 비활성화된 모니터 중 fail_count >= 5인 것 알림
    await step.run('check-failed-monitors', async () => {
      const supabase = createSupabaseAdminClient()
      
      const { data } = await supabase
        .from('monitors')
        .select('id, user_id, product_name')
        .eq('is_active', false)
        .gte('fail_count', 5)

      if (data && data.length > 0) {
        console.log(`Found ${data.length} failed monitors`)
        // TODO: Phase 5에서 사용자에게 알림 발송
      }
    })

    return { success: true }
  }
)

