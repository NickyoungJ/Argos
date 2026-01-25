'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ElementSelectorProps {
  url: string
  onSelect: (selector: string, previewText: string) => void
  onCancel: () => void
}

export function ElementSelector({ url, onSelect, onCancel }: ElementSelectorProps) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null)
  const [previewText, setPreviewText] = useState<string>('')
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number } | null>(null)

  // 스크린샷 로드
  useEffect(() => {
    const loadScreenshot = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })

        if (!response.ok) {
          throw new Error('스크린샷 로드 실패')
        }

        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        setScreenshotUrl(objectUrl)
      } catch (err: any) {
        console.error('Screenshot error:', err)
        setError(err.message || '스크린샷을 불러올 수 없습니다')
      } finally {
        setLoading(false)
      }
    }

    loadScreenshot()

    // Cleanup
    return () => {
      if (screenshotUrl) {
        URL.revokeObjectURL(screenshotUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  // 이미지 클릭 핸들러
  const handleImageClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 실제 이미지 크기 대비 클릭 위치 비율 계산
    const img = e.currentTarget
    const scaleX = 1280 / img.clientWidth // 스크린샷은 1280px 고정
    const scaleY = 720 / img.clientHeight // 스크린샷은 720px 고정
    
    const actualX = Math.round(x * scaleX)
    const actualY = Math.round(y * scaleY)

    console.log(`Clicked at: (${actualX}, ${actualY})`)

    try {
      setLoading(true)
      const response = await fetch('/api/element-from-point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, x: actualX, y: actualY }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'CSS Selector 추출 실패')
      }

      setSelectedSelector(data.selector)
      setPreviewText(data.preview)
      console.log('Selected:', data)
    } catch (err: any) {
      console.error('Element selection error:', err)
      alert(err.message || '요소 선택 실패')
    } finally {
      setLoading(false)
    }
  }

  // 마우스 이동 핸들러 (위치 표시용)
  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setHoveredPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setHoveredPosition(null)
  }

  const handleConfirm = () => {
    if (selectedSelector) {
      onSelect(selectedSelector, previewText)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      {/* 상단 고정 안내 바 */}
      <div className="sticky top-0 left-0 right-0 z-[60] bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">🎯 감시할 영역을 선택하세요</h3>
              <p className="text-sm text-blue-100">
                👇 아래 스크린샷에서 감시하고 싶은 부분을 클릭하세요
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="bg-white text-blue-600 hover:bg-gray-100"
                disabled={loading}
              >
                취소
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedSelector || loading}
                className="bg-green-500 hover:bg-green-600 text-white min-w-[150px] disabled:bg-gray-400"
              >
                {selectedSelector ? '✓ 이 영역 감시하기' : '영역을 클릭하세요'}
              </Button>
            </div>
          </div>

          {/* 상태 표시 */}
          <div className="mt-3">
            {loading ? (
              <div className="p-3 bg-blue-800 rounded-lg border-2 border-blue-400 text-center">
                <p className="text-sm">⏳ 로딩 중...</p>
              </div>
            ) : selectedSelector ? (
              <div className="p-3 bg-green-500 rounded-lg border-2 border-green-300">
                <p className="text-xs font-mono mb-1">
                  <strong>✓ 선택됨:</strong> {selectedSelector}
                </p>
                <p className="text-sm font-medium truncate">
                  &quot;{previewText}&quot;
                </p>
              </div>
            ) : (
              <div className="p-3 bg-blue-800 rounded-lg border-2 border-dashed border-blue-400">
                <p className="text-sm text-center">
                  ⬇️ 아래 스크린샷에서 원하는 영역을 클릭하세요
                  {hoveredPosition && (
                    <span className="ml-2 font-mono">
                      (x: {Math.round(hoveredPosition.x)}, y: {Math.round(hoveredPosition.y)})
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 스크린샷 표시 */}
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-800 font-semibold mb-2">❌ 오류</p>
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={onCancel} 
              variant="outline" 
              className="mt-4"
            >
              돌아가기
            </Button>
          </div>
        ) : loading ? (
          <div className="bg-gray-100 rounded-lg p-12 text-center animate-pulse">
            <div className="w-full h-96 bg-gray-200 rounded"></div>
            <p className="mt-4 text-gray-600">스크린샷 로딩 중...</p>
          </div>
        ) : screenshotUrl ? (
          <div className="relative">
            <div className="border-4 border-blue-500 rounded-lg overflow-hidden shadow-2xl">
              <img
                src={screenshotUrl}
                alt="Page Screenshot"
                className="w-full cursor-crosshair"
                onClick={handleImageClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              💡 <strong>Tip:</strong> 가격, 재고 표시, 구매 버튼 등 변화를 감지하고 싶은 부분을 클릭하세요
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
