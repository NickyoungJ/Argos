/**
 * Solapi (CoolSMS) 카카오 알림톡 및 SMS 발송
 */

import axios from 'axios'

const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET
const SOLAPI_SENDER = process.env.SOLAPI_SENDER_PHONE // 발신번호

const SOLAPI_BASE_URL = 'https://api.solapi.com'

interface SolapiMessage {
  to: string
  from: string
  text: string
  type?: 'SMS' | 'LMS' | 'MMS'
}

interface KakaoAlimtalkMessage {
  to: string
  from: string
  kakaoOptions: {
    pfId: string
    templateId: string
    variables: Record<string, string>
  }
}

/**
 * SMS 발송
 */
export async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET || !SOLAPI_SENDER) {
    console.error('Solapi credentials not configured')
    return { success: false, error: 'SMS 설정이 되어있지 않습니다' }
  }

  try {
    const response = await axios.post(
      `${SOLAPI_BASE_URL}/messages/v4/send`,
      {
        message: {
          to: to.replace(/-/g, ''),
          from: SOLAPI_SENDER.replace(/-/g, ''),
          text: message,
          type: message.length > 90 ? 'LMS' : 'SMS',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SOLAPI_API_KEY}`,
        },
      }
    )

    return { success: true }
  } catch (error: any) {
    console.error('SMS send error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.errorMessage || error.message,
    }
  }
}

/**
 * 카카오 알림톡 발송
 */
export async function sendKakaoAlimtalk(
  to: string,
  templateId: string,
  variables: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET) {
    console.error('Solapi credentials not configured')
    return { success: false, error: '카카오 알림톡 설정이 되어있지 않습니다' }
  }

  const pfId = process.env.SOLAPI_KAKAO_PF_ID

  if (!pfId) {
    console.error('Kakao Plus Friend ID not configured')
    return { success: false, error: '카카오 채널 ID가 설정되지 않았습니다' }
  }

  try {
    const response = await axios.post(
      `${SOLAPI_BASE_URL}/messages/v4/send`,
      {
        message: {
          to: to.replace(/-/g, ''),
          from: SOLAPI_SENDER?.replace(/-/g, ''),
          kakaoOptions: {
            pfId,
            templateId,
            variables,
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SOLAPI_API_KEY}`,
        },
      }
    )

    return { success: true }
  } catch (error: any) {
    console.error('Kakao Alimtalk error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.errorMessage || error.message,
    }
  }
}

