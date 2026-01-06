'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function TestScraperPage() {
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<'VISUAL' | 'SEMANTIC'>('VISUAL')
  const [targetOption, setTargetOption] = useState('')
  const [productName, setProductName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          mode,
          targetOption: targetOption || undefined,
          productName: productName || undefined,
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
      <h1 className="text-3xl font-bold mb-6">스크래퍼 테스트</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>테스트 설정</CardTitle>
          <CardDescription>
            스크래핑 엔진을 테스트하세요 (Phase 2 개발용)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL</label>
            <Input
              type="url"
              placeholder="https://example.com/product/123"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">모드</label>
            <div className="flex gap-4">
              <Button
                variant={mode === 'VISUAL' ? 'default' : 'outline'}
                onClick={() => setMode('VISUAL')}
              >
                Visual (해시 비교)
              </Button>
              <Button
                variant={mode === 'SEMANTIC' ? 'default' : 'outline'}
                onClick={() => setMode('SEMANTIC')}
              >
                Semantic (AI 분석)
              </Button>
            </div>
          </div>

          {mode === 'SEMANTIC' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  타겟 옵션 (선택 사항)
                </label>
                <Input
                  placeholder="예: 사이즈 270, 빨간색"
                  value={targetOption}
                  onChange={(e) => setTargetOption(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  상품명 (선택 사항)
                </label>
                <Input
                  placeholder="예: 나이키 에어맥스"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
            </>
          )}

          <Button
            onClick={handleTest}
            disabled={!url || loading}
            className="w-full"
          >
            {loading ? '테스트 중...' : '테스트 실행'}
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
            <pre className="bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>더미 테스트 페이지</CardTitle>
          <CardDescription>
            로컬 테스트용 페이지를 사용하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            <code>/test-scraper/dummy</code> 페이지를 사용하여 테스트할 수 있습니다.
          </p>
          <Button
            variant="outline"
            onClick={() => window.open('/test-scraper/dummy', '_blank')}
          >
            더미 페이지 열기
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

