/**
 * CSS Selector 유틸리티
 * 특정 DOM 요소의 고유한 CSS Selector를 생성합니다.
 */

/**
 * 요소의 최적화된 CSS Selector를 생성
 * ID > Class > nth-child 순서로 고유성을 보장
 */
export function generateOptimalSelector(element: Element): string {
  // ID가 있으면 가장 간단
  if (element.id) {
    return `#${element.id}`
  }

  // Class를 사용한 selector 생성
  const path: string[] = []
  let current: Element | null = element

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.tagName.toLowerCase()

    // Class가 있으면 추가
    if (current.classList.length > 0) {
      selector += '.' + Array.from(current.classList).join('.')
    }

    // 형제 중 몇 번째인지 계산
    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children)
      const sameTagSiblings = siblings.filter(
        (sibling) => sibling.tagName === current!.tagName
      )
      
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(current) + 1
        selector += `:nth-of-type(${index})`
      }
    }

    path.unshift(selector)

    // body까지만 올라감
    if (current.tagName.toLowerCase() === 'body') {
      break
    }

    current = current.parentElement
  }

  return path.join(' > ')
}

/**
 * Selector가 유효한지 검증
 */
export function isValidSelector(selector: string): boolean {
  try {
    document.querySelector(selector)
    return true
  } catch {
    return false
  }
}

/**
 * Selector로 요소를 찾고 유효성 검증
 */
export function findElementBySelector(
  selector: string
): Element | null {
  try {
    return document.querySelector(selector)
  } catch {
    return null
  }
}

/**
 * 요소의 표시 가능한 텍스트 추출 (미리보기용)
 */
export function getElementPreviewText(element: Element): string {
  const text = element.textContent?.trim() || ''
  return text.length > 50 ? text.slice(0, 50) + '...' : text
}

