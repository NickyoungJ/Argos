/**
 * 알림 발송 작업 함수
 */

import { inngest } from '../client'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { sendNotification } from '@/lib/notification/sender'
import type { NotificationData } from '@/lib/notification/templates'

interface NotificationEventData {
  userId: string
  monitorId: string
  productName: string
  targetOption?: string
  url: string
  data?: any
}

/**
 * 알림 발송 함수
 */
export const notificationSendJob = inngest.createFunction(
  {
    id: 'notification-send',
    name: 'Send Notification',
    retries: 2,
  },
  { event: 'notification/send' },
  async ({ event, step }) => {
    const eventData = event.data as NotificationEventData

    // Step 1: 사용자 정보 가져오기
    const user = await step.run('fetch-user', async () => {
      const supabase = createSupabaseAdminClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', eventData.userId)
        .single()

      if (error || !data) {
        throw new Error(`User not found: ${eventData.userId}`)
      }

      return data
    })

    // Step 2: 알림 데이터 준비
    const notificationData: NotificationData = {
      productName: eventData.productName,
      targetOption: eventData.targetOption,
      url: eventData.url,
      price: eventData.data?.price,
      timestamp: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    // Step 3: 알림 발송
    const result = await step.run('send-notification', async () => {
      return await sendNotification({
        to: {
          email: user.email,
          phoneNumber: user.phone_number || undefined,
        },
        tier: user.tier,
        data: notificationData,
      })
    })

    // Step 4: 발송 결과 로깅
    await step.run('log-notification', async () => {
      const supabase = createSupabaseAdminClient()

      let message = '알림 발송 '
      if (result.success) {
        message += `성공 (${result.finalChannel})`
      } else {
        message += '실패: '
        const errors = Object.entries(result.channels)
          .filter(([_, v]) => !v.success)
          .map(([k, v]) => `${k}: ${v.error}`)
        message += errors.join(', ')
      }

      await supabase.from('logs').insert({
        monitor_id: eventData.monitorId,
        status: result.success ? 'CHANGED' : 'ERROR',
        message,
      })
    })

    return {
      userId: eventData.userId,
      monitorId: eventData.monitorId,
      success: result.success,
      channel: result.finalChannel,
    }
  }
)

