/**
 * Playwright를 사용한 HTML 페칭
 */

import { chromium, Browser, Page } from 'playwright'
import { randomDelay, getRandomUserAgent, withTimeout } from './utils'

let browserInstance: Browser | null = null

// 브라우저 인스턴스 가져오기 (재사용)
async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    // Browserless (Vercel 배포용)
    const browserlessUrl = process.env.BROWSERLESS_URL
    
    if (browserlessUrl) {
      console.log('🌐 Connecting to Browserless...')
      browserInstance = await chromium.connect(browserlessUrl)
    } else {
      // 로컬 Playwright
      console.log('💻 Launching local Chromium...')
      browserInstance = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
        ],
      })
    }
  }
  return browserInstance
}

// 브라우저 종료
export async function closeBrowser(): Promise<void> {
  if (browserInstance && browserInstance.isConnected()) {
    await browserInstance.close()
    browserInstance = null
  }
}

export interface FetchHtmlOptions {
  waitForSelector?: string
  timeout?: number
  delayBefore?: boolean
  returnPage?: boolean  // true일 경우 page 객체도 반환 (focused 분석용)
}

export interface FetchHtmlResult {
  html: string
  url: string
  success: boolean
  page?: Page  // Focused 분석용
  error?: string
}

/**
 * URL에서 HTML을 페칭
 * - 랜덤 딜레이 적용 (봇 탐지 회피)
 * - User-Agent 로테이션
 * - 타임아웃 적용
 */
export async function fetchHtml(
  url: string,
  options: FetchHtmlOptions = {}
): Promise<FetchHtmlResult> {
  const {
    waitForSelector,
    timeout = 30000,
    delayBefore = true,
    returnPage = false,
  } = options

  let page: Page | null = null
  let context: any = null

  try {
    // 랜덤 딜레이 (봇 탐지 회피)
    if (delayBefore) {
      await randomDelay()
    }

    const browser = await getBrowser()
    context = await browser.newContext({
      userAgent: getRandomUserAgent(),
      viewport: { width: 1920, height: 1080 },
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul',
    })

    page = await context.newPage()

    // 추가 스텔스 설정
    await page!.addInitScript(() => {
      // Navigator.webdriver 제거
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      })
      
      // Chrome 객체 추가
      ;(window as any).chrome = {
        runtime: {},
      }
      
      // Permissions 모킹
      const originalQuery = window.navigator.permissions.query
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied' } as PermissionStatus)
          : originalQuery(parameters)
    })

    // 페이지 로드
    const response = await withTimeout(
      page!.goto(url, { waitUntil: 'networkidle', timeout }),
      timeout
    )

    if (!response) {
      throw new Error('Failed to load page: No response')
    }

    // 특정 셀렉터 대기 (옵션)
    if (waitForSelector) {
      await page!.waitForSelector(waitForSelector, { timeout: 5000 })
    }

    // HTML 추출
    const html = await page!.content()

    // returnPage가 false면 context 닫기
    if (!returnPage && context) {
      await context.close()
    }

    return {
      html,
      url,
      success: true,
      page: returnPage ? page : undefined,  // returnPage가 true면 page 반환
    }
  } catch (error: any) {
    // 에러 시 정리
    if (context) {
      try {
        await context.close()
      } catch (e) {
        // Ignore
      }
    }
    
    return {
      html: '',
      url,
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * 여러 URL을 순차적으로 페칭 (랜덤 딜레이 포함)
 */
export async function fetchMultipleHtml(
  urls: string[],
  options: FetchHtmlOptions = {}
): Promise<FetchHtmlResult[]> {
  const results: FetchHtmlResult[] = []

  for (const url of urls) {
    const result = await fetchHtml(url, options)
    results.push(result)
  }

  return results
}

