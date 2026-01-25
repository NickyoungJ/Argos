/**
 * 좌표에서 CSS Selector 찾기 API
 * 클릭한 좌표의 요소를 찾아 CSS Selector 반환
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, x, y } = await request.json()

    if (!url || x === undefined || y === undefined) {
      return NextResponse.json(
        { error: 'URL과 좌표(x, y)가 필요합니다' },
        { status: 400 }
      )
    }

    // Browserless /function API 사용
    const browserlessToken = process.env.BROWSERLESS_API_KEY || process.env.BROWSERLESS_URL?.match(/token=([^&]+)/)?.[1]
    
    if (!browserlessToken) {
      return NextResponse.json(
        { error: 'BROWSERLESS_API_KEY가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    console.log(`🌐 Using Browserless /function API for element selection`)
    console.log(`📍 Coordinates: (${x}, ${y})`)
    
    // Browserless /function 엔드포인트로 커스텀 코드 실행
    const response = await fetch(`https://chrome.browserless.io/function?token=${browserlessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: `
          module.exports = async ({ page }) => {
            await page.setViewport({ width: 1280, height: 720 });
            await page.goto('${url}', { waitUntil: 'networkidle2' });
            await page.waitForTimeout(2000);
            
            const result = await page.evaluate((coords) => {
              const element = document.elementFromPoint(coords.x, coords.y);
              
              if (!element) {
                return { error: '해당 위치에 요소가 없습니다' };
              }

              // CSS Selector 생성
              const getSelector = (el) => {
                if (el.id) return '#' + el.id;
                
                const classes = Array.from(el.classList).filter(c => c && !c.includes(' '));
                if (classes.length > 0) {
                  const classSelector = '.' + classes.join('.');
                  const matches = document.querySelectorAll(classSelector);
                  if (matches.length === 1) return classSelector;
                }
                
                const tagName = el.tagName.toLowerCase();
                if (el.parentElement) {
                  const siblings = Array.from(el.parentElement.children);
                  const index = siblings.indexOf(el) + 1;
                  const parentSelector = getSelector(el.parentElement);
                  return parentSelector + ' > ' + tagName + ':nth-child(' + index + ')';
                }
                
                return tagName;
              };

              const selector = getSelector(element);
              const text = (element.textContent || '').trim().slice(0, 100) || '(텍스트 없음)';
              const tagName = element.tagName.toLowerCase();

              return { selector, preview: text, tagName };
            }, { x: ${x}, y: ${y} });
            
            return result;
          };
        `,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Browserless function API error:', errorText)
      throw new Error(`Browserless API error: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Element selection result:', result)

    if (result.error) {
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
    console.error('❌ Element from point error:', error)
    return NextResponse.json(
      { error: error.message || 'CSS Selector 추출 실패' },
      { status: 500 }
    )
  }
}
