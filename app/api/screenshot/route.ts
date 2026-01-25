/**
 * 스크린샷 생성 API
 * Playwright로 페이지를 로드하고 스크린샷을 반환
 */

import { NextRequest, NextResponse } from 'next/server'
import { chromium } from 'playwright'

export async function POST(request: NextRequest) {
  let browser = null
  
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL이 필요합니다' },
        { status: 400 }
      )
    }

    // Browserless 또는 로컬 Playwright
    const browserlessUrl = process.env.BROWSERLESS_URL
    
    if (browserlessUrl) {
      console.log('🌐 Connecting to Browserless for screenshot...')
      browser = await chromium.connect(browserlessUrl)
    } else {
      console.log('💻 Launching local Chromium for screenshot...')
      browser = await chromium.launch({ headless: true })
    }

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })

    const page = await context.newPage()
    
    // 페이지 로드
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })

    // 짧은 대기 (렌더링 완료)
    await page.waitForTimeout(1000)

    // 스크린샷 생성
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false, // 보이는 영역만
    })

    await context.close()
    
    // 이미지로 반환 (Buffer를 Uint8Array로 변환)
    return new Response(new Uint8Array(screenshot), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('Screenshot error:', error)
    return NextResponse.json(
      { error: error.message || '스크린샷 생성 실패' },
      { status: 500 }
    )
  } finally {
    if (browser && !process.env.BROWSERLESS_URL) {
      // 로컬 브라우저만 닫기 (Browserless는 자동 관리)
      await browser.close().catch(() => {})
    }
  }
}
