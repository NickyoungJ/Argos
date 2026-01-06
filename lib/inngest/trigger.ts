/**
 * Inngest 이벤트 트리거 유틸리티
 */

import { inngest } from './client'

/**
 * 모니터 체크 이벤트 트리거 (수동 실행)
 */
export async function triggerMonitorCheck(monitorId: string) {
  await inngest.send({
    name: 'monitor/check',
    data: {
      monitorId,
    },
  })
}

/**
 * 여러 모니터 일괄 체크
 */
export async function triggerBatchMonitorCheck(monitorIds: string[]) {
  const events = monitorIds.map(id => ({
    name: 'monitor/check' as const,
    data: { monitorId: id },
  }))

  await inngest.send(events)
}

