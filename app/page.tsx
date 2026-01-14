'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { ElementSelector } from '@/components/selector/element-selector'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [productName, setProductName] = useState('')
  const [mode, setMode] = useState<'VISUAL' | 'SEMANTIC'>('VISUAL')
  const [targetOption, setTargetOption] = useState('')
  const [targetSelector, setTargetSelector] = useState<string | null>(null)
  const [selectorPreview, setSelectorPreview] = useState<string>('')
  const [showSelectorMode, setShowSelectorMode] = useState(false)
  const [frequency, setFrequency] = useState(30)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // 로그인 상태 체크
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    setIsLoggedIn(!!user)
    setUserEmail(user?.email || null)
  }

  const handleLogout = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUserEmail(null)
    router.refresh()
  }

  const handleLoadPreview = () => {
    if (!url) return
    setShowPreview(true)
  }

  const handleStartMonitoring = async () => {
    setError(null)
    
    try {
      // 로그인 체크
      const response = await fetch('/api/monitors', {
        method: 'GET',
      })

      if (response.status === 401) {
        // 로그인 필요 - 데이터 저장하고 로그인 페이지로
        sessionStorage.setItem('pending_monitor', JSON.stringify({
          url,
          productName,
          mode,
          targetOption,
          targetSelector,
          frequency,
          email,
        }))
        router.push('/auth')
        return
      }

      // 이미 로그인됨 - 바로 모니터 생성
      setLoading(true)
      
      const createResponse = await fetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          product_name: productName,
          target_option: targetOption || undefined,
          target_selector: targetSelector || undefined,
          mode,
          frequency,
        }),
      })

      if (createResponse.ok) {
        router.push('/dashboard')
      } else {
        // 에러 응답 파싱
        const errorData = await createResponse.json()
        const errorMessage = errorData.error || '모니터 생성 실패'
        setError(errorMessage)
        console.error('모니터 생성 실패:', errorData)
      }
    } catch (error) {
      console.error('네트워크 에러:', error)
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 헤더 */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">🚫 NoMoreF5</span>
            </div>
            <nav className="flex items-center gap-4">
              <a href="#features" className="text-sm hover:text-primary transition-colors">기능</a>
              <a href="#pricing" className="text-sm hover:text-primary transition-colors">요금제</a>
              <div className="h-4 w-px bg-gray-300 mx-2"></div>
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline">대시보드</Button>
                  </Link>
                  <Button variant="ghost" onClick={handleLogout}>
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="ghost">로그인</Button>
                  </Link>
                  <Link href="/auth">
                    <Button>시작하기</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
            품절 상품 재입고를
            <br />
            <span className="text-blue-600">가장 빠르게</span> 알려드립니다
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            AI 기반 실시간 모니터링으로 원하는 상품의 재입고를 놓치지 마세요.<br />
            1분마다 체크하고, 카카오톡으로 즉시 알림을 받을 수 있습니다.
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              ⚡ 무료로 시작
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              💳 신용카드 불필요
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              🚀 5분 만에 설정
            </span>
          </div>
        </div>
      </section>

      {/* URL 입력 섹션 */}
      <section className="container mx-auto px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-xl border-2">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder="https://example.com/product/123 - 감시할 페이지 URL을 입력하세요"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-14 text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadPreview()}
                />
              </div>
              <Button 
                onClick={handleLoadPreview}
                disabled={!url}
                className="h-14 px-8 text-base"
                size="lg"
              >
                Go →
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              💡 <strong>테스트해보기:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">http://localhost:3000/test-scraper/dummy</code>
            </p>
          </Card>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <section className="container mx-auto px-6 py-8">
        {showPreview ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 페이지 프리뷰 */}
            <div className="lg:col-span-2">
              <Card className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">페이지 프리뷰</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(url, '_blank')}
                  >
                    새 창에서 열기 →
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <iframe
                    id="preview-iframe"
                    src={url}
                    className="w-full h-[600px]"
                    title="Page Preview"
                  />
                </div>
              </Card>
            </div>

            {/* 오른쪽: 설정 패널 */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-6">
                <h3 className="text-lg font-bold mb-4">모니터링 설정</h3>

                <div className="space-y-4">
                  {/* 상품명 */}
                  <div>
                    <Label htmlFor="productName">상품명 *</Label>
                    <Input
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="예: 나이키 에어맥스"
                    />
                  </div>

                  {/* 감시 영역 선택 */}
                  <div>
                    <Label>감시 영역 (선택)</Label>
                    {targetSelector ? (
                      <div className="p-3 bg-green-50 border border-green-500 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-xs text-green-800 font-mono break-all mb-1">
                              {targetSelector}
                            </p>
                            <p className="text-sm text-green-900 truncate">
                              &quot;{selectorPreview}&quot;
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setTargetSelector(null)
                              setSelectorPreview('')
                            }}
                            className="ml-2 text-green-700 hover:text-green-900"
                          >
                            ✕
                          </button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            // 기존 선택 초기화
                            setTargetSelector(null)
                            setSelectorPreview('')
                            setShowSelectorMode(true)
                          }}
                        >
                          다시 선택하기
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowSelectorMode(true)}
                        >
                          🎯 영역 선택하기
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          특정 영역만 감시하여 오알람을 줄일 수 있습니다
                        </p>
                      </>
                    )}
                  </div>

                  {/* 감시 모드 */}
                  <div>
                    <Label htmlFor="mode">감시 모드</Label>
                    <Select
                      id="mode"
                      value={mode}
                      onChange={(e) => setMode(e.target.value as any)}
                    >
                      <option value="VISUAL">👁️ Visual - 페이지 변화 감지</option>
                      <option value="SEMANTIC">🤖 AI - 정확한 옵션 분석</option>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mode === 'VISUAL' 
                        ? '페이지의 모든 변화를 감지합니다'
                        : 'AI가 특정 옵션의 재입고를 정확히 판단합니다 (Pro)'}
                    </p>
                  </div>

                  {/* 타겟 옵션 */}
                  {mode === 'SEMANTIC' && (
                    <div>
                      <Label htmlFor="targetOption">타겟 옵션</Label>
                      <Input
                        id="targetOption"
                        value={targetOption}
                        onChange={(e) => setTargetOption(e.target.value)}
                        placeholder="예: 사이즈 270, 빨간색"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        AI가 이 옵션의 재입고 여부를 판단합니다
                      </p>
                    </div>
                  )}

                  {/* 체크 주기 */}
                  <div>
                    <Label htmlFor="frequency">체크 주기</Label>
                    <Select
                      id="frequency"
                      value={frequency}
                      onChange={(e) => setFrequency(parseInt(e.target.value))}
                    >
                      <option value="30">30분마다 (Free)</option>
                      <option value="5">5분마다 (Standard)</option>
                      <option value="1">1분마다 (Pro)</option>
                    </Select>
                  </div>

                  {/* 이메일 */}
                  <div>
                    <Label htmlFor="email">알림 받을 이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* 알림 조건 안내 */}
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <p className="font-medium mb-1">🔔 알림 받는 경우:</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• 페이지에 변화가 감지될 때</li>
                      <li>• 품절 → 재입고 변경 시</li>
                      {mode === 'SEMANTIC' && targetOption && (
                        <li>• &quot;{targetOption}&quot; 옵션 재입고 시</li>
                      )}
                    </ul>
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>오류:</strong> {error}
                      </p>
                    </div>
                  )}

                  {/* 시작 버튼 */}
                  <Button
                    onClick={handleStartMonitoring}
                    disabled={!productName || loading}
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    {loading ? '생성 중...' : 'Start Monitoring 🚀'}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    무료로 시작 • 신용카드 불필요
                  </p>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* URL 입력 전 - 랜딩페이지 컨텐츠 */
          <>
            {/* 사용 방법 */}
            <div className="max-w-4xl mx-auto text-center py-16">
              <h2 className="text-3xl font-bold mb-4">간단한 3단계</h2>
              <p className="text-muted-foreground mb-12">
                복잡한 설정 없이 바로 시작하세요
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 rounded-xl bg-white border hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🔗</div>
                  <h3 className="font-semibold text-lg mb-2">1. URL 입력</h3>
                  <p className="text-sm text-muted-foreground">
                    감시할 상품 페이지 주소를 위에 입력하세요
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-white border hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">⚙️</div>
                  <h3 className="font-semibold text-lg mb-2">2. 조건 설정</h3>
                  <p className="text-sm text-muted-foreground">
                    감시 모드와 알림 조건을 선택하세요
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-white border hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🔔</div>
                  <h3 className="font-semibold text-lg mb-2">3. 알림 받기</h3>
                  <p className="text-sm text-muted-foreground">
                    변화 감지 시 즉시 카카오톡/이메일로 알림
                  </p>
                </div>
              </div>
            </div>

            {/* 주요 기능 */}
            <section id="features" className="py-20 bg-slate-50 -mx-6 px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-4">왜 NoMoreF5인가요?</h2>
                  <p className="text-xl text-muted-foreground">
                    더 빠르고, 더 정확하고, 더 스마트한 모니터링
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">🤖</div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">AI 기반 분석</h3>
                        <p className="text-muted-foreground">
                          GPT-4를 활용한 정확한 재입고 판단. &quot;사이즈 270&quot; 같은 특정 옵션만 추적할 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">⚡</div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">최대 1분 간격 체크</h3>
                        <p className="text-muted-foreground">
                          Pro 플랜에서는 1분마다 자동 체크. 품절 상품을 가장 먼저 발견하세요.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">💬</div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">카카오톡 알림</h3>
                        <p className="text-muted-foreground">
                          이메일뿐만 아니라 카카오톡 알림톡으로 즉시 받아보세요. 놓칠 일이 없습니다.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">🛡️</div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">봇 차단 우회</h3>
                        <p className="text-muted-foreground">
                          Stealth 기술로 일반 사용자처럼 행동. 대부분의 사이트에서 안정적으로 작동합니다.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            {/* Pricing 섹션 */}
            <section id="pricing" className="py-20">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-4">합리적인 가격</h2>
                  <p className="text-xl text-muted-foreground">
                    필요한 만큼만 사용하세요
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Free */}
                  <Card className="p-8 border-2">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">Free</h3>
                      <div className="text-4xl font-bold mb-4">₩0</div>
                      <p className="text-sm text-muted-foreground mb-6">시작하기에 완벽</p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">최대 3개 URL 감시</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">30분 간격 체크</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">Visual 모드</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">이메일 알림</span>
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full">
                      무료로 시작하기
                    </Button>
                  </Card>

                  {/* Standard */}
                  <Card className="p-8 border-2 border-blue-500 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                      인기
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">Standard</h3>
                      <div className="text-4xl font-bold mb-4">₩9,900<span className="text-lg text-muted-foreground">/월</span></div>
                      <p className="text-sm text-muted-foreground mb-6">대부분의 사용자에게 추천</p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">최대 10개 URL 감시</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">5분 간격 체크</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">Visual 모드</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">이메일 + 카카오톡 알림</span>
                      </li>
                    </ul>
                    <Button className="w-full">
                      지금 시작하기
                    </Button>
                  </Card>

                  {/* Pro */}
                  <Card className="p-8 border-2">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">Pro</h3>
                      <div className="text-4xl font-bold mb-4">₩29,900<span className="text-lg text-muted-foreground">/월</span></div>
                      <p className="text-sm text-muted-foreground mb-6">프로를 위한 최고의 선택</p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">무제한 URL 감시</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">1분 간격 체크</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">Visual + AI 모드</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">이메일 + 카카오톡 알림</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">월 100 AI 크레딧</span>
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full">
                      Pro로 업그레이드
                    </Button>
                  </Card>
                </div>
              </div>
            </section>

            {/* CTA 섹션 */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 -mx-6 px-6 text-white">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4">
                  지금 바로 시작하세요
                </h2>
                <p className="text-xl mb-8 text-blue-100">
                  원하는 상품의 재입고를 가장 빠르게 알려드립니다
                </p>
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  무료로 시작하기 →
                </Button>
              </div>
            </section>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold mb-4">🚫 NoMoreF5</div>
              <p className="text-sm text-muted-foreground">
                AI 기반 실시간<br />재입고 알림 서비스
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">제품</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary">기능</a></li>
                <li><a href="#pricing" className="hover:text-primary">요금제</a></li>
                <li><Link href="/dashboard" className="hover:text-primary">대시보드</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">문서</a></li>
                <li><a href="#" className="hover:text-primary">API</a></li>
                <li><a href="#" className="hover:text-primary">문의하기</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">법적 고지</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">이용약관</a></li>
                <li><a href="#" className="hover:text-primary">개인정보처리방침</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 NoMoreF5. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Element Selector Modal */}
      {showSelectorMode && showPreview && (
        <ElementSelector
          url={url}
          onSelect={(selector, preview) => {
            setTargetSelector(selector)
            setSelectorPreview(preview)
            setShowSelectorMode(false)
          }}
          onCancel={() => setShowSelectorMode(false)}
        />
      )}
    </div>
  )
}

