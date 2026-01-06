/**
 * HTML 전처리 - AI 토큰 사용량 최적화
 * script, style, svg, 주석 등을 제거하여 토큰 사용량을 90% 이상 절감
 */

import { JSDOM } from 'jsdom'

export interface CleanHtmlOptions {
  removeScripts?: boolean
  removeStyles?: boolean
  removeSvgs?: boolean
  removeComments?: boolean
  removeEmptyElements?: boolean
  preserveAttributes?: string[]
}

const DEFAULT_OPTIONS: CleanHtmlOptions = {
  removeScripts: true,
  removeStyles: true,
  removeSvgs: true,
  removeComments: true,
  removeEmptyElements: true,
  preserveAttributes: ['class', 'id', 'data-price', 'data-stock', 'data-available'],
}

/**
 * HTML을 정리하여 AI 분석에 적합한 형태로 변환
 */
export function cleanHtml(
  html: string,
  options: CleanHtmlOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  try {
    const dom = new JSDOM(html)
    const document = dom.window.document

    // 1. script 태그 제거
    if (opts.removeScripts) {
      const scripts = document.querySelectorAll('script')
      scripts.forEach(script => script.remove())
    }

    // 2. style 태그 및 인라인 스타일 제거
    if (opts.removeStyles) {
      const styles = document.querySelectorAll('style')
      styles.forEach(style => style.remove())
      
      // 인라인 스타일 제거
      const elementsWithStyle = document.querySelectorAll('[style]')
      elementsWithStyle.forEach(el => el.removeAttribute('style'))
    }

    // 3. SVG 제거
    if (opts.removeSvgs) {
      const svgs = document.querySelectorAll('svg')
      svgs.forEach(svg => svg.remove())
    }

    // 4. 불필요한 속성 제거 (preserveAttributes에 없는 것들)
    const allElements = document.querySelectorAll('*')
    allElements.forEach(el => {
      const attributes = Array.from(el.attributes)
      attributes.forEach(attr => {
        if (!opts.preserveAttributes?.includes(attr.name)) {
          // 특정 데이터 속성은 보존
          if (!attr.name.startsWith('data-')) {
            el.removeAttribute(attr.name)
          }
        }
      })
    })

    // 5. 빈 요소 제거
    if (opts.removeEmptyElements) {
      const emptyElements = Array.from(document.querySelectorAll('*')).filter(
        el => {
          const hasNoText = !el.textContent?.trim()
          const hasNoChildren = el.children.length === 0
          const isNotImportant = !['img', 'input', 'br', 'hr', 'meta', 'link'].includes(
            el.tagName.toLowerCase()
          )
          return hasNoText && hasNoChildren && isNotImportant
        }
      )
      emptyElements.forEach(el => el.remove())
    }

    // 6. 주석 제거
    if (opts.removeComments) {
      const removeComments = (node: Node) => {
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
          const child = node.childNodes[i]
          if (child.nodeType === 8) { // Comment node
            node.removeChild(child)
          } else if (child.nodeType === 1) { // Element node
            removeComments(child)
          }
        }
      }
      removeComments(document.body)
    }

    // 최종 HTML 반환
    return document.body.innerHTML
  } catch (error) {
    console.error('Error cleaning HTML:', error)
    return html // 에러 시 원본 반환
  }
}

/**
 * HTML에서 텍스트만 추출 (더 공격적인 정리)
 */
export function extractText(html: string): string {
  try {
    const dom = new JSDOM(html)
    const text = dom.window.document.body.textContent || ''
    
    // 여러 줄바꿈과 공백 정리
    return text
      .replace(/\s+/g, ' ')
      .trim()
  } catch (error) {
    console.error('Error extracting text:', error)
    return ''
  }
}

/**
 * HTML에서 가격 정보 추출 시도 (패턴 기반)
 */
export function extractPriceInfo(html: string): {
  prices: number[]
  currency: string
} {
  const prices: number[] = []
  let currency = 'KRW'

  // 가격 패턴 매칭
  const pricePatterns = [
    /₩\s?([\d,]+)/g,
    /(\d{1,3}(?:,\d{3})+)\s?원/g,
    /(\d+)\s?원/g,
    /\$\s?([\d,]+\.?\d*)/g,
  ]

  pricePatterns.forEach(pattern => {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      const priceStr = match[1].replace(/,/g, '')
      const price = parseInt(priceStr, 10)
      if (!isNaN(price) && price > 0) {
        prices.push(price)
      }
    }
  })

  // $ 기호 감지
  if (html.includes('$')) {
    currency = 'USD'
  }

  return {
    prices: [...new Set(prices)].sort((a, b) => a - b),
    currency,
  }
}

