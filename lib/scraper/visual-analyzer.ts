/**
 * Visual 분석 - DOM 해시 비교
 */

import CryptoJS from 'crypto-js'
import { cleanHtml, extractText } from './clean-html'

export interface VisualAnalysisResult {
  changed: boolean
  currentHash: string
  previousHash?: string
  similarity?: number
}

/**
 * HTML 텍스트를 해시로 변환
 */
export function generateHash(html: string): string {
  const cleaned = extractText(html)
  return CryptoJS.SHA256(cleaned).toString()
}

/**
 * 두 HTML을 비교하여 변화 감지
 */
export function compareHtml(
  currentHtml: string,
  previousHtml: string
): VisualAnalysisResult {
  const currentHash = generateHash(currentHtml)
  const previousHash = generateHash(previousHtml)

  const changed = currentHash !== previousHash

  // 유사도 계산 (선택 사항)
  const similarity = calculateSimilarity(
    extractText(currentHtml),
    extractText(previousHtml)
  )

  return {
    changed,
    currentHash,
    previousHash,
    similarity,
  }
}

/**
 * 간단한 유사도 계산 (Jaccard similarity)
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/))
  const words2 = new Set(text2.toLowerCase().split(/\s+/))

  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])

  if (union.size === 0) return 1

  return intersection.size / union.size
}

/**
 * 특정 셀렉터 영역만 비교
 */
export function compareBySelector(
  currentHtml: string,
  previousHtml: string,
  selector: string
): VisualAnalysisResult {
  // JSDOM을 사용하여 특정 영역 추출 후 비교
  // (구현은 cleanHtml과 유사한 방식)
  return compareHtml(currentHtml, previousHtml)
}

/**
 * Visual 모드에서 변화 감지
 */
export interface VisualMonitorResult {
  changed: boolean
  hash: string
  message: string
}

export async function analyzeVisual(
  currentHtml: string,
  previousHash?: string
): Promise<VisualMonitorResult> {
  const currentHash = generateHash(currentHtml)

  if (!previousHash) {
    return {
      changed: false,
      hash: currentHash,
      message: '초기 스냅샷 생성됨',
    }
  }

  const changed = currentHash !== previousHash

  return {
    changed,
    hash: currentHash,
    message: changed ? '페이지 변화 감지됨' : '변화 없음',
  }
}

