/**
 * Resend 이메일 발송
 */

import { Resend } from 'resend'

// Lazy initialization - API 키가 있을 때만 초기화
let resend: Resend | null = null

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@restockalert.com'

/**
 * 이메일 발송
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  const resendClient = getResendClient()
  
  if (!resendClient) {
    console.warn('Resend API key not configured - skipping email')
    return { success: false, error: '이메일 설정이 되어있지 않습니다' }
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

