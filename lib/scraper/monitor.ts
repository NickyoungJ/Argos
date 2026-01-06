/**
 * 통합 모니터링 로직 - Visual과 Semantic 모드 통합
 */

import { fetchHtml } from './fetch-html'
import { analyzeVisual } from './visual-analyzer'
import { analyzeSemantic } from './semantic-analyzer'
import { analyzeFocusedArea, extractFocusedHTML } from './focused-analyzer'
import type { MonitorMode } from '../types/database'

export interface MonitorOptions {
  mode: MonitorMode
  targetOption?: string
  targetSelector?: string // CSS Selector for focused monitoring
  productName?: string
  previousHash?: string
}

export interface MonitorResult {
  success: boolean
  changed: boolean
  currentHash?: string
  data?: any
  message: string
  error?: string
}

/**
 * 모니터링 실행 (Visual 또는 Semantic)
 */
export async function runMonitor(
  url: string,
  options: MonitorOptions
): Promise<MonitorResult> {
  try {
    // 1. HTML 페칭
    const fetchResult = await fetchHtml(url)

    if (!fetchResult.success || !fetchResult.page) {
      return {
        success: false,
        changed: false,
        message: '페이지 로딩 실패',
        error: fetchResult.error,
      }
    }

    // 2. CSS Selector가 있으면 Focused 분석
    if (options.targetSelector) {
      return await runFocusedMonitor(fetchResult.page, options)
    }

    // 3. CSS Selector가 없으면 전체 페이지 분석
    if (options.mode === 'VISUAL') {
      return await runVisualMonitor(fetchResult.html, options)
    } else if (options.mode === 'SEMANTIC') {
      return await runSemanticMonitor(fetchResult.html, options)
    } else {
      return {
        success: false,
        changed: false,
        message: '알 수 없는 모드',
        error: `Invalid mode: ${options.mode}`,
      }
    }
  } catch (error: any) {
    return {
      success: false,
      changed: false,
      message: '모니터링 실패',
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Focused 모니터링 (CSS Selector로 특정 영역만 분석)
 */
async function runFocusedMonitor(
  page: any,
  options: MonitorOptions
): Promise<MonitorResult> {
  if (!options.targetSelector) {
    return {
      success: false,
      changed: false,
      message: 'CSS Selector가 지정되지 않음',
    }
  }

  // Visual Mode: 해당 영역의 해시만 비교
  if (options.mode === 'VISUAL') {
    const result = await analyzeFocusedArea(
      page,
      options.targetSelector,
      options.previousHash
    )

    if (!result.success) {
      return {
        success: false,
        changed: false,
        message: '영역 분석 실패',
        error: result.error,
      }
    }

    return {
      success: true,
      changed: result.changed,
      currentHash: result.currentHash,
      message: result.changed ? '선택 영역에 변화 감지됨!' : '선택 영역 변화 없음',
    }
  }

  // Semantic Mode: 해당 영역의 HTML만 AI에 전달
  if (options.mode === 'SEMANTIC') {
    const focusedHTML = await extractFocusedHTML(page, options.targetSelector)

    if (!focusedHTML) {
      return {
        success: false,
        changed: false,
        message: '영역 추출 실패',
        error: `선택한 영역을 찾을 수 없습니다: ${options.targetSelector}`,
      }
    }

    // AI 분석 (focused HTML만 전달)
    const aiResult = await analyzeSemantic(focusedHTML, {
      targetOption: options.targetOption,
      productName: options.productName,
    })

    const changed = aiResult.is_restocked && aiResult.option_available

    let message = ''
    if (changed) {
      message = `재입고 감지됨!`
      if (options.targetOption) {
        message += ` (옵션: ${options.targetOption})`
      }
      if (aiResult.price) {
        message += ` - 가격: ${aiResult.price.toLocaleString()}원`
      }
    } else {
      message = '재입고 되지 않음'
      if (aiResult.reasoning) {
        message += ` (${aiResult.reasoning})`
      }
    }

    return {
      success: true,
      changed,
      data: aiResult,
      message,
    }
  }

  return {
    success: false,
    changed: false,
    message: '알 수 없는 모드',
  }
}

/**
 * Visual 모니터링
 */
async function runVisualMonitor(
  html: string,
  options: MonitorOptions
): Promise<MonitorResult> {
  const result = await analyzeVisual(html, options.previousHash)

  return {
    success: true,
    changed: result.changed,
    currentHash: result.hash,
    message: result.message,
  }
}

/**
 * Semantic 모니터링 (AI 분석)
 */
async function runSemanticMonitor(
  html: string,
  options: MonitorOptions
): Promise<MonitorResult> {
  try {
    const aiResult = await analyzeSemantic(html, {
      targetOption: options.targetOption,
      productName: options.productName,
    })

    const changed = aiResult.is_restocked && aiResult.option_available

    let message = ''
    if (changed) {
      message = `재입고 감지됨!`
      if (options.targetOption) {
        message += ` (옵션: ${options.targetOption})`
      }
      if (aiResult.price) {
        message += ` - 가격: ${aiResult.price.toLocaleString()}원`
      }
    } else {
      message = '재입고 되지 않음'
      if (aiResult.reasoning) {
        message += ` (${aiResult.reasoning})`
      }
    }

    return {
      success: true,
      changed,
      data: aiResult,
      message,
    }
  } catch (error: any) {
    return {
      success: false,
      changed: false,
      message: 'AI 분석 실패',
      error: error.message,
    }
  }
}

