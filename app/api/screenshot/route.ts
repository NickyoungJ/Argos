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

    // Browserless API 토큰
    const browserlessToken = process.env.BROWSERLESS_API_KEY || process.env.BROWSERLESS_URL?.match(/token=([^&]+)/)?.[1]
    
    if (browserlessToken) {
      // Browserless HTTP API 사용 (더 안정적)
      console.log('🌐 Using Browserless HTTP API for screenshot...')
      
      const startTime = Date.now()
      const response = await fetch(`https://chrome.browserless.io/screenshot?token=${browserlessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          options: {
            type: 'png',
            fullPage: false,
          },
          viewport: {
            width: 1280,
            height: 720,
          },
          waitFor: 2000,
          gotoOptions: {
            waitUntil: 'networkidle2', // Puppeteer 형식
          },
          addScriptTag: [{
            content: `
              Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
              window.chrome = { runtime: {} };
            `
          }],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Browserless API error: ${response.status} ${errorText}`)
      }

      const screenshot = await response.arrayBuffer()
      console.log(`✅ Screenshot completed via Browserless HTTP API in ${Date.now() - startTime}ms (${screenshot.byteLength} bytes)`)
      
      // 이미지로 반환
      return new Response(new Uint8Array(screenshot), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache',
        },
      })
    } else {
      // 로컬 Playwright 사용
      console.log('💻 Launching local Chromium for screenshot...')
      browser = await chromium.launch({ headless: true })

      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      })

      const page = await context.newPage()
      
      // 페이지 로드
      console.log(`📄 Loading page: ${url}`)
      const loadStart = Date.now()
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      console.log(`✅ Page loaded in ${Date.now() - loadStart}ms`)

      // 짧은 대기 (렌더링 완료)
      await page.waitForTimeout(1000)

      // 스크린샷 생성
      console.log('📸 Taking screenshot...')
      const screenshotStart = Date.now()
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false,
      })
      console.log(`✅ Screenshot taken in ${Date.now() - screenshotStart}ms (${screenshot.length} bytes)`)

      await context.close()
      
      // 이미지로 반환
      return new Response(new Uint8Array(screenshot), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache',
        },
      })
    }
  } catch (error: any) {
    console.error('❌ Screenshot error:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    })
    
    // 더 자세한 에러 정보 반환
    const errorDetails = {
      message: error.message || '스크린샷 생성 실패',
      name: error.name,
      browserless: !!process.env.BROWSERLESS_URL,
      browserlessUrlPrefix: process.env.BROWSERLESS_URL?.substring(0, 40),
      timestamp: new Date().toISOString(),
    }
    
    return NextResponse.json(
      { error: error.message || '스크린샷 생성 실패', details: errorDetails },
      { status: 500 }
    )
  } finally {
    if (browser && !process.env.BROWSERLESS_URL) {
      // 로컬 브라우저만 닫기 (Browserless는 자동 관리)
      await browser.close().catch(() => {})
    }
  }
}
