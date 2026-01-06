/**
 * 스크래퍼 메인 엔트리포인트
 */

export { fetchHtml, fetchMultipleHtml, closeBrowser } from './fetch-html'
export { cleanHtml, extractText, extractPriceInfo } from './clean-html'
export { analyzeVisual, compareHtml, generateHash } from './visual-analyzer'
export { analyzeSemantic, analyzeSemanticBatch, calculateCreditsNeeded } from './semantic-analyzer'
export { randomDelay, getRandomUserAgent, withTimeout } from './utils'

export type { FetchHtmlOptions, FetchHtmlResult } from './fetch-html'
export type { CleanHtmlOptions } from './clean-html'
export type { VisualAnalysisResult, VisualMonitorResult } from './visual-analyzer'
export type { SemanticAnalysisOptions, SemanticAnalysisResult } from './semantic-analyzer'

