'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export default function TestNotificationPage() {
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [tier, setTier] = useState<'FREE' | 'STANDARD' | 'PRO'>('FREE')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phoneNumber: phoneNumber || undefined,
          tier,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">알림 테스트</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>테스트 설정</CardTitle>
          <CardDescription>
            알림 발송을 테스트하세요 (Phase 5 개발용)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">이메일 *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">전화번호 (카카오톡/SMS용)</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="010-1234-5678"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Standard/Pro 티어에서 사용됩니다
            </p>
          </div>

          <div>
            <Label htmlFor="tier">요금제 *</Label>
            <Select
              id="tier"
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
            >
              <option value="FREE">Free (이메일만)</option>
              <option value="STANDARD">Standard (카카오톡/SMS + 이메일)</option>
              <option value="PRO">Pro (카카오톡/SMS + 이메일)</option>
            </Select>
          </div>

          <Button
            onClick={handleTest}
            disabled={!email || loading}
            className="w-full"
          >
            {loading ? '테스트 중...' : '알림 발송 테스트'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.success ? '✅ 성공' : '❌ 실패'}
            </CardTitle>
            <CardDescription>테스트 결과</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>

            {result.success && result.finalChannel && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  알림이 {result.finalChannel} 채널로 발송되었습니다!
                </p>
              </div>
            )}

            {!result.success && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">
                  알림 발송에 실패했습니다. 설정을 확인하세요.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>설정 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">1. Solapi 설정 (.env.local)</p>
            <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
              <li>SOLAPI_API_KEY</li>
              <li>SOLAPI_API_SECRET</li>
              <li>SOLAPI_SENDER_PHONE</li>
              <li>SOLAPI_KAKAO_PF_ID</li>
              <li>SOLAPI_KAKAO_TEMPLATE_ID</li>
            </ul>
          </div>

          <div>
            <p className="font-medium">2. Resend 설정 (.env.local)</p>
            <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
              <li>RESEND_API_KEY</li>
              <li>RESEND_FROM_EMAIL</li>
            </ul>
          </div>

          <div className="pt-2 border-t">
            <p className="text-muted-foreground">
              <strong>참고:</strong> 실제 알림 발송을 위해서는 Solapi와 Resend 계정이 필요합니다.
              설정이 없으면 해당 채널은 실패 처리됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

