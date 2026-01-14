'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { generateOptimalSelector, getElementPreviewText } from '@/lib/utils/selector'

interface ElementSelectorProps {
  url: string
  onSelect: (selector: string, previewText: string) => void
  onCancel: () => void
}

export function ElementSelector({ url, onSelect, onCancel }: ElementSelectorProps) {
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null)
  const [previewText, setPreviewText] = useState<string>('')
  const [hoveredElement, setHoveredElement] = useState<{
    selector: string
    text: string
  } | null>(null)

  // iframe 내부의 요소에 이벤트 리스너 추가
  useEffect(() => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement
    if (!iframe || !iframe.contentWindow) return

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document

    // 기존 하이라이트 모두 제거
    iframeDoc.querySelectorAll('[data-hover-highlight]').forEach((el) => {
      el.removeAttribute('data-hover-highlight')
    })
    iframeDoc.querySelectorAll('[data-selected-highlight]').forEach((el) => {
      el.removeAttribute('data-selected-highlight')
    })

    const handleMouseOver = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const target = e.target as Element
      if (!target || target === iframeDoc.body || target === iframeDoc.documentElement) {
        return
      }

      const selector = generateOptimalSelector(target)
      const text = getElementPreviewText(target)

      setHoveredElement({ selector, text })

      // 하이라이트 스타일 추가
      target.setAttribute('data-hover-highlight', 'true')
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as Element
      if (target) {
        target.removeAttribute('data-hover-highlight')
      }
      setHoveredElement(null)
    }

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const target = e.target as Element
      if (!target || target === iframeDoc.body || target === iframeDoc.documentElement) {
        return
      }

      const selector = generateOptimalSelector(target)
      const text = getElementPreviewText(target)

      setSelectedSelector(selector)
      setPreviewText(text)

      // 모든 하이라이트 제거
      iframeDoc.querySelectorAll('[data-hover-highlight]').forEach((el) => {
        el.removeAttribute('data-hover-highlight')
      })
      iframeDoc.querySelectorAll('[data-selected-highlight]').forEach((el) => {
        el.removeAttribute('data-selected-highlight')
      })

      // 선택된 요소 하이라이트
      target.setAttribute('data-selected-highlight', 'true')
    }

    // 스타일 추가
    const style = iframeDoc.createElement('style')
    style.textContent = `
      [data-hover-highlight="true"] {
        outline: 2px dashed #3b82f6 !important;
        outline-offset: 2px !important;
        cursor: pointer !important;
        background-color: rgba(59, 130, 246, 0.1) !important;
      }
      [data-selected-highlight="true"] {
        outline: 3px solid #10b981 !important;
        outline-offset: 2px !important;
        background-color: rgba(16, 185, 129, 0.15) !important;
      }
    `
    iframeDoc.head.appendChild(style)

    // 이벤트 리스너 등록
    iframeDoc.addEventListener('mouseover', handleMouseOver)
    iframeDoc.addEventListener('mouseout', handleMouseOut)
    iframeDoc.addEventListener('click', handleClick)

    return () => {
      iframeDoc.removeEventListener('mouseover', handleMouseOver)
      iframeDoc.removeEventListener('mouseout', handleMouseOut)
      iframeDoc.removeEventListener('click', handleClick)
      style.remove()
    }
  }, [url])

  const handleConfirm = () => {
    if (selectedSelector) {
      onSelect(selectedSelector, previewText)
    }
  }

  return (
    <>
      {/* 상단 고정 안내 바 */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">🎯 감시할 영역을 선택하세요</h3>
              <p className="text-sm text-blue-100">
                👇 아래 페이지에서 감시하고 싶은 부분에 마우스를 올리고 클릭하세요
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                취소
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedSelector}
                className="bg-green-500 hover:bg-green-600 text-white min-w-[150px] disabled:bg-gray-400"
              >
                {selectedSelector ? '✓ 이 영역 감시하기' : '영역을 선택하세요'}
              </Button>
            </div>
          </div>

          {/* 상태 표시 */}
          <div className="mt-3">
            {selectedSelector ? (
              <div className="p-3 bg-green-500 rounded-lg border-2 border-green-300">
                <p className="text-xs font-mono mb-1">
                  <strong>✓ 선택됨:</strong> {selectedSelector}
                </p>
                <p className="text-sm font-medium">
                  &quot;{previewText}&quot;
                </p>
              </div>
            ) : hoveredElement ? (
              <div className="p-3 bg-blue-500 rounded-lg border-2 border-blue-300">
                <p className="text-xs font-mono mb-1">
                  <strong>호버 중:</strong> {hoveredElement.selector}
                </p>
                <p className="text-sm truncate">
                  {hoveredElement.text}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-blue-800 rounded-lg border-2 border-dashed border-blue-400">
                <p className="text-sm text-center">
                  ⬇️ 아래 페이지에서 원하는 영역에 마우스를 올려보세요
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 페이지 상단 여백 (안내 바 높이만큼) */}
      <div className="h-[180px]"></div>
    </>
  )
}

