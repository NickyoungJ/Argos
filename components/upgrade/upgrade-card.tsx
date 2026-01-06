'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { UserTier } from '@/lib/types/database'
import { TIER_LIMITS } from '@/lib/quota/checker'

interface UpgradeCardProps {
  currentTier: UserTier
}

const TIER_INFO = {
  FREE: {
    name: 'Free',
    price: '무료',
    description: '개인 사용자를 위한 기본 플랜',
    features: [
      '최대 1개 모니터',
      '30분마다 감시',
      'Visual 모드',
      '이메일 알림',
    ],
  },
  STANDARD: {
    name: 'Standard',
    price: '₩9,900/월',
    description: '일반 사용자를 위한 플랜',
    features: [
      '최대 10개 모니터',
      '5분마다 감시',
      'Visual 모드',
      '이메일 + 카카오톡 알림',
    ],
  },
  PRO: {
    name: 'Pro',
    price: '₩29,900/월',
    description: '파워 유저를 위한 프리미엄 플랜',
    features: [
      '최대 30개 모니터',
      '1분마다 감시',
      'Visual + AI 분석 (Semantic 모드)',
      '월 1,000 AI 크레딧',
      '이메일 + 카카오톡 알림',
      '우선 지원',
    ],
  },
}

export function UpgradeCard({ currentTier }: UpgradeCardProps) {
  const handleUpgrade = (tier: UserTier) => {
    // TODO: Phase 5+ 실제 결제 연동
    alert(`${tier} 티어 업그레이드는 곧 지원될 예정입니다!`)
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {(Object.keys(TIER_INFO) as UserTier[]).map((tier) => {
        const info = TIER_INFO[tier]
        const isCurrent = tier === currentTier
        const limits = TIER_LIMITS[tier]

        return (
          <Card key={tier} className={isCurrent ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{info.name}</CardTitle>
                {isCurrent && <Badge>현재 플랜</Badge>}
              </div>
              <CardDescription>{info.description}</CardDescription>
              <div className="text-2xl font-bold">{info.price}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {info.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {!isCurrent && (
                <Button
                  onClick={() => handleUpgrade(tier)}
                  className="w-full"
                  variant={tier === 'PRO' ? 'default' : 'outline'}
                >
                  {tier === 'FREE' ? '다운그레이드' : '업그레이드'}
                </Button>
              )}

              {isCurrent && (
                <Button disabled className="w-full" variant="outline">
                  현재 사용 중
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

