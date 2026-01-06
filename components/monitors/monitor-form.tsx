'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { Monitor, UserTier } from '@/lib/types/database'
import { TIER_LIMITS } from '@/lib/quota/checker'

interface MonitorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  userTier: UserTier
  monitor?: Monitor
}

export function MonitorForm({ open, onOpenChange, onSuccess, userTier, monitor }: MonitorFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    url: monitor?.url || '',
    product_name: monitor?.product_name || '',
    target_option: monitor?.target_option || '',
    mode: monitor?.mode || 'VISUAL',
    frequency: monitor?.frequency || TIER_LIMITS[userTier].minFrequency,
  })

  const tierInfo = TIER_LIMITS[userTier]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = monitor
        ? `/api/monitors/${monitor.id}`
        : '/api/monitors'
      
      const method = monitor ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '오류가 발생했습니다')
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{monitor ? '모니터 수정' : '새 모니터 추가'}</DialogTitle>
          <DialogDescription>
            상품 재입고를 감시할 모니터를 {monitor ? '수정' : '추가'}합니다
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="url">상품 URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/product/123"
              required
            />
          </div>

          <div>
            <Label htmlFor="product_name">상품명 *</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="나이키 에어맥스"
              required
            />
          </div>

          <div>
            <Label htmlFor="target_option">타겟 옵션 (선택)</Label>
            <Input
              id="target_option"
              value={formData.target_option}
              onChange={(e) => setFormData({ ...formData, target_option: e.target.value })}
              placeholder="예: 사이즈 270, 빨간색"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Semantic 모드에서 특정 옵션 감지
            </p>
          </div>

          <div>
            <Label htmlFor="mode">감시 모드 *</Label>
            <Select
              id="mode"
              value={formData.mode}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
              disabled={!tierInfo.allowedModes.includes('SEMANTIC')}
            >
              <option value="VISUAL">Visual (해시 비교)</option>
              <option value="SEMANTIC" disabled={!tierInfo.allowedModes.includes('SEMANTIC')}>
                Semantic (AI 분석) - Pro 전용
              </option>
            </Select>
          </div>

          <div>
            <Label htmlFor="frequency">감시 주기 (분) *</Label>
            <Select
              id="frequency"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: parseInt(e.target.value) })}
            >
              {userTier === 'PRO' && <option value="1">1분</option>}
              {(userTier === 'PRO' || userTier === 'STANDARD') && <option value="5">5분</option>}
              <option value="30">30분</option>
              <option value="60">1시간</option>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              최소 주기: {tierInfo.minFrequency}분 ({userTier} 티어)
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? '처리 중...' : monitor ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

