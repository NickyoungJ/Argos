/**
 * 알림 발송 통합 로직 (우선순위 처리)
 */

import { sendKakaoAlimtalk, sendSMS } from './solapi'
import { sendEmail } from './resend'
import { getTextTemplate, getEmailTemplate, getKakaoVariables, type NotificationData } from './templates'

export interface SendNotificationParams {
  to: {
    email: string
    phoneNumber?: string
  }
  tier: 'FREE' | 'STANDARD' | 'PRO'
  data: NotificationData
}

export interface NotificationResult {
  success: boolean
  channels: {
    kakao?: { success: boolean; error?: string }
    sms?: { success: boolean; error?: string }
    email?: { success: boolean; error?: string }
  }
  finalChannel?: 'kakao' | 'sms' | 'email'
}

/**
 * 알림 발송 (우선순위: 카카오 알림톡 -> SMS -> 이메일)
 */
export async function sendNotification(
  params: SendNotificationParams
): Promise<NotificationResult> {
  const { to, tier, data } = params
  const result: NotificationResult = {
    success: false,
    channels: {},
  }

  // Free 티어는 이메일만
  if (tier === 'FREE') {
    const emailTemplate = getEmailTemplate(data)
    const emailResult = await sendEmail(to.email, emailTemplate.subject, emailTemplate.html)
    
    result.channels.email = emailResult
    result.success = emailResult.success
    result.finalChannel = emailResult.success ? 'email' : undefined

    return result
  }

  // Standard, Pro 티어는 카카오톡/SMS 우선
  if ((tier === 'STANDARD' || tier === 'PRO') && to.phoneNumber) {
    // 1차 시도: 카카오 알림톡
    const kakaoVariables = getKakaoVariables(data)
    const kakaoTemplateId = process.env.SOLAPI_KAKAO_TEMPLATE_ID || 'restock_alert'

    const kakaoResult = await sendKakaoAlimtalk(
      to.phoneNumber,
      kakaoTemplateId,
      kakaoVariables
    )

    result.channels.kakao = kakaoResult

    if (kakaoResult.success) {
      result.success = true
      result.finalChannel = 'kakao'
      return result
    }

    // 2차 시도: SMS
    const smsText = getTextTemplate(data)
    const smsResult = await sendSMS(to.phoneNumber, smsText)

    result.channels.sms = smsResult

    if (smsResult.success) {
      result.success = true
      result.finalChannel = 'sms'
      return result
    }
  }

  // 최후 수단: 이메일
  const emailTemplate = getEmailTemplate(data)
  const emailResult = await sendEmail(to.email, emailTemplate.subject, emailTemplate.html)

  result.channels.email = emailResult
  result.success = emailResult.success
  result.finalChannel = emailResult.success ? 'email' : undefined

  return result
}

