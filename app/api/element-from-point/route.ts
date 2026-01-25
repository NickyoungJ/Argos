/**
 * 좌표에서 CSS Selector 찾기 API
 * 클릭한 좌표의 요소를 찾아 CSS Selector 반환
 */

import { NextRequest, NextResponse } from 'next/server'
import { chromium } from 'playwright'

export async function POST(request: NextRequest) {
  let browser = null
  
  try {
    const { url, x, y } = await request.json()

    if (!url || x === undefined || y === undefined) {
      return NextResponse.json(
        { error: 'URL과 좌표(x, y)가 필요합니다' },
        { status: 400 }
      )
    }

    // Browserless 또는 로컬 Playwright
    const browserlessToken = process.env.BROWSERLESS_API_KEY || process.env.BROWSERLESS_URL?.match(/token=([^&]+)/)?.[1]
    
    if (browserlessToken) {
      try {
        const wsUrl = `wss://chrome.browserless.io?token=${browserlessToken}&stealth`
        console.log('🌐 Connecting to Browserless WebSocket with stealth...')
        browser = await chromium.connect(wsUrl, { 
          timeout: 45000,
          slowMo: 100, // 더 자연스럽게
        })
        console.log('✅ Connected to Browserless')
      } catch (error: any) {
        console.error('❌ Browserless connection failed:', error.message)
        console.log('💻 Falling back to local Chromium...')
        browser = await chromium.launch({ headless: true })
      }
    } else {
      console.log('💻 Launching local Chromium...')
      browser = await chromium.launch({ headless: true })
    }

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul',
    })

    const page = await context.newPage()
    
    // 봇 감지 우회 스크립트
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      })
      
      // Chrome 객체 추가
      Object.defineProperty(window, 'chrome', {
        get: () => ({
          runtime: {},
          loadTimes: () => {},
          csi: () => {},
        }),
      })
      
      // Permissions API 오버라이드
      const originalQuery = window.navigator.permissions.query
      window.navigator.permissions.query = (parameters: any) => (
        parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied' } as PermissionStatus)
          : originalQuery(parameters)
      )
    })
    
    console.log(`📄 Loading page for element selection: ${url}`)
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })

    await page.waitForTimeout(2000)

    // 좌표에서 요소 찾기 및 Selector 생성
    const result = await page.evaluate((coords) => {
      const element = document.elementFromPoint(coords.x, coords.y)
      
      if (!element) {
        return { error: '해당 위치에 요소가 없습니다' }
      }

      // CSS Selector 생성 (고유한 selector)
      const getSelector = (el: Element): string => {
        // ID가 있으면 사용
        if (el.id) {
          return `#${el.id}`
        }

        // Class들 사용
        const classes = Array.from(el.classList).filter(c => c && !c.includes(' '))
        if (classes.length > 0) {
          const classSelector = `.${classes.join('.')}`
          const matches = document.querySelectorAll(classSelector)
          if (matches.length === 1) {
            return classSelector
          }
        }

        // 부모와 조합
        const tagName = el.tagName.toLowerCase()
        if (el.parentElement) {
          const siblings = Array.from(el.parentElement.children)
          const index = siblings.indexOf(el) + 1
          const parentSelector = getSelector(el.parentElement)
          return `${parentSelector} > ${tagName}:nth-child(${index})`
        }

        return tagName
      }

      const selector = getSelector(element)
      
      // 미리보기 텍스트 (최대 100자)
      const text = element.textContent?.trim().slice(0, 100) || '(텍스트 없음)'
      
      // 요소 타입
      const tagName = element.tagName.toLowerCase()

      return {
        selector,
        preview: text,
        tagName,
      }
    }, { x, y })

    await context.close()

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('Element from point error:', error)
    return NextResponse.json(
      { error: error.message || 'CSS Selector 추출 실패' },
      { status: 500 }
    )
  } finally {
    if (browser && !process.env.BROWSERLESS_URL) {
      await browser.close().catch(() => {})
    }
  }
}
