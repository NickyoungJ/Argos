/**
 * Focused Analyzer - CSS Selector로 지정된 영역만 분석
 */

import { Page } from 'playwright'
import crypto from 'crypto'
import { cleanHTML } from './clean-html'

export interface FocusedAnalysisResult {
  success: boolean
  changed: boolean
  currentHash?: string
  extractedHTML?: string
  error?: string
}

/**
 * CSS Selector로 특정 영역만 추출하여 Visual 분석
 */
export async function analyzeFocusedArea(
  page: Page,
  targetSelector: string,
  previousHash?: string
): Promise<FocusedAnalysisResult> {
  try {
    // Selector로 요소 찾기
    const element = await page.$(targetSelector)

    if (!element) {
      return {
        success: false,
        changed: false,
        error: `선택한 영역을 찾을 수 없습니다: ${targetSelector}`,
      }
    }

    // 해당 영역의 HTML 추출
    const rawHTML = await element.innerHTML()

    // HTML 정리 (불필요한 요소 제거)
    const cleanedHTML = cleanHTML(rawHTML)

    // 해시 생성
    const currentHash = crypto
      .createHash('sha256')
      .update(cleanedHTML)
      .digest('hex')

    // 이전 해시와 비교
    if (!previousHash) {
      return {
        success: true,
        changed: false,
        currentHash,
        extractedHTML: cleanedHTML,
      }
    }

    const changed = currentHash !== previousHash

    return {
      success: true,
      changed,
      currentHash,
      extractedHTML: cleanedHTML,
    }
  } catch (error) {
    return {
      success: false,
      changed: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    }
  }
}

/**
 * CSS Selector로 특정 영역만 추출 (Semantic 분석용)
 * Semantic Analyzer에 전달할 HTML만 반환
 */
export async function extractFocusedHTML(
  page: Page,
  targetSelector: string
): Promise<string | null> {
  try {
    const element = await page.$(targetSelector)

    if (!element) {
      throw new Error(`선택한 영역을 찾을 수 없습니다: ${targetSelector}`)
    }

    const rawHTML = await element.innerHTML()
    const cleanedHTML = cleanHTML(rawHTML)

    return cleanedHTML
  } catch (error) {
    console.error('Failed to extract focused HTML:', error)
    return null
  }
}

