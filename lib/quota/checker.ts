/**
 * 요금제별 할당량 체크 로직
 */

import type { UserTier, MonitorMode } from '../types/database'

export interface TierLimits {
  maxMonitors: number
  minFrequency: number
  allowedModes: MonitorMode[]
  hasAICredits: boolean
}

// 요금제별 제한
export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  FREE: {
    maxMonitors: 1,
    minFrequency: 30,
    allowedModes: ['VISUAL'],
    hasAICredits: false,
  },
  STANDARD: {
    maxMonitors: 10,
    minFrequency: 5,
    allowedModes: ['VISUAL'],
    hasAICredits: false,
  },
  PRO: {
    maxMonitors: 30,
    minFrequency: 1,
    allowedModes: ['VISUAL', 'SEMANTIC'],
    hasAICredits: true,
  },
}

/**
 * 모니터 추가 가능 여부 확인
 */
export function canAddMonitor(
  tier: UserTier,
  currentMonitorCount: number
): { allowed: boolean; reason?: string } {
  const limits = TIER_LIMITS[tier]

  if (currentMonitorCount >= limits.maxMonitors) {
    return {
      allowed: false,
      reason: `${tier} 티어는 최대 ${limits.maxMonitors}개의 모니터만 등록할 수 있습니다.`,
    }
  }

  return { allowed: true }
}

/**
 * 주기 설정 가능 여부 확인
 */
export function canUseFrequency(
  tier: UserTier,
  frequency: number
): { allowed: boolean; reason?: string } {
  const limits = TIER_LIMITS[tier]

  if (frequency < limits.minFrequency) {
    return {
      allowed: false,
      reason: `${tier} 티어는 최소 ${limits.minFrequency}분 주기만 사용할 수 있습니다.`,
    }
  }

  return { allowed: true }
}

/**
 * 모드 사용 가능 여부 확인
 */
export function canUseMode(
  tier: UserTier,
  mode: MonitorMode
): { allowed: boolean; reason?: string } {
  const limits = TIER_LIMITS[tier]

  if (!limits.allowedModes.includes(mode)) {
    return {
      allowed: false,
      reason: `${tier} 티어는 ${mode} 모드를 사용할 수 없습니다. PRO 티어로 업그레이드하세요.`,
    }
  }

  return { allowed: true }
}

/**
 * 모니터 생성 가능 여부 전체 검증
 */
export interface MonitorCreationParams {
  tier: UserTier
  currentMonitorCount: number
  frequency: number
  mode: MonitorMode
}

export function validateMonitorCreation(
  params: MonitorCreationParams
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  const monitorCheck = canAddMonitor(params.tier, params.currentMonitorCount)
  if (!monitorCheck.allowed && monitorCheck.reason) {
    errors.push(monitorCheck.reason)
  }

  const frequencyCheck = canUseFrequency(params.tier, params.frequency)
  if (!frequencyCheck.allowed && frequencyCheck.reason) {
    errors.push(frequencyCheck.reason)
  }

  const modeCheck = canUseMode(params.tier, params.mode)
  if (!modeCheck.allowed && modeCheck.reason) {
    errors.push(modeCheck.reason)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 티어 정보 가져오기
 */
export function getTierInfo(tier: UserTier) {
  return TIER_LIMITS[tier]
}

