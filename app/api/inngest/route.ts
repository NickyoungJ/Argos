/**
 * Inngest API Route
 */

import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import {
  monitorCheckJob,
  cronEveryMinute,
  cronEveryFiveMinutes,
  cronEveryThirtyMinutes,
  cronDailyCleanup,
  notificationSendJob,
} from '@/lib/inngest/functions'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    monitorCheckJob,
    cronEveryMinute,
    cronEveryFiveMinutes,
    cronEveryThirtyMinutes,
    cronDailyCleanup,
    notificationSendJob,
  ],
})

