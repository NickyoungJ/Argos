'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export default function TestInngestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testEvent = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/test-inngest', { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        setResult('✅ Inngest 이벤트 발송 성공!\n\n' + 
          'Inngest Dev Server (http://localhost:8288) 또는\n' +
          'Inngest Cloud 대시보드에서 실행 확인하세요.')
      } else {
        setResult('❌ 실패: ' + data.error)
      }
    } catch (error) {
      setResult('❌ 에러: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Inngest 연동 테스트</CardTitle>
          <CardDescription>
            Inngest 이벤트를 발송하고 백그라운드 작업이 실행되는지 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testEvent} disabled={loading}>
            {loading ? '테스트 중...' : 'Inngest 이벤트 발송 테스트'}
          </Button>
          
          {result && (
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
              {result}
            </pre>
          )}

          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p><strong>확인 방법:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>위 버튼 클릭</li>
              <li>Inngest Dev Server (http://localhost:8288) 또는 Cloud 대시보드 열기</li>
              <li>"Runs" 탭에서 실행 로그 확인</li>
              <li>성공하면 콘솔에 "Test event received" 출력됨</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
