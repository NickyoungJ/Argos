'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useState } from 'react'

export default function UpgradeUserPage() {
  const [email, setEmail] = useState('sjda6074@naver.com')
  const [tier, setTier] = useState('PRO')
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/admin/upgrade-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tier })
      })

      const data = await response.json()

      if (data.success) {
        setResult(`✅ 성공!\n\n${data.message}\n\n이전: ${data.before.tier} → 이후: ${data.after.tier}`)
      } else {
        setResult(`❌ 실패: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ 에러: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>사용자 티어 업그레이드 (Admin)</CardTitle>
          <CardDescription>
            사용자의 요금제를 변경합니다. (개발/테스트용)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier">티어</Label>
            <Select 
              id="tier"
              value={tier} 
              onChange={(e) => setTier(e.target.value)}
            >
              <option value="FREE">Free (30분 주기)</option>
              <option value="STANDARD">Standard (5분 주기)</option>
              <option value="PRO">Pro (1분 주기)</option>
            </Select>
          </div>

          <Button 
            onClick={handleUpgrade} 
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? '처리 중...' : '티어 업그레이드'}
          </Button>

          {result && (
            <div className={`p-4 rounded whitespace-pre-wrap ${
              result.startsWith('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {result}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded text-sm text-gray-600">
            <p className="font-semibold mb-2">티어별 모니터링 주기:</p>
            <ul className="space-y-1">
              <li>• <strong>Free:</strong> 30분마다</li>
              <li>• <strong>Standard:</strong> 5분마다</li>
              <li>• <strong>Pro:</strong> 1분마다</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
