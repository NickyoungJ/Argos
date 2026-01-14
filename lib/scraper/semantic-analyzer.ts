/**
 * Semantic AI 분석 - GPT를 사용한 상품 재입고 및 옵션 분석
 */

import OpenAI from 'openai'
import { cleanHtml } from './clean-html'

// Lazy initialization to avoid build-time errors
let openaiInstance: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다. Semantic 모드를 사용하려면 OpenAI API 키가 필요합니다.')
    }
    openaiInstance = new OpenAI({ apiKey })
  }
  return openaiInstance
}

export interface SemanticAnalysisOptions {
  targetOption?: string
  productName?: string
}

export interface SemanticAnalysisResult {
  is_restocked: boolean
  price: number | null
  option_available: boolean
  confidence: number
  reasoning?: string
}

/**
 * GPT를 사용하여 상품 페이지 분석
 */
export async function analyzeSemantic(
  html: string,
  options: SemanticAnalysisOptions = {}
): Promise<SemanticAnalysisResult> {
  const { targetOption, productName } = options

  // HTML 전처리 (토큰 절감)
  const cleanedHtml = cleanHtml(html)

  // 프롬프트 생성
  const prompt = buildPrompt(cleanedHtml, targetOption, productName)

  try {
    const openai = getOpenAI()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 이커머스 상품 페이지 분석 전문가입니다. 
HTML을 분석하여 재입고 여부, 가격, 특정 옵션의 구매 가능 여부를 정확히 판단합니다.
응답은 반드시 JSON 형식으로만 해야 합니다.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content) as SemanticAnalysisResult

    return {
      is_restocked: result.is_restocked || false,
      price: result.price || null,
      option_available: result.option_available || false,
      confidence: result.confidence || 0.5,
      reasoning: result.reasoning,
    }
  } catch (error: any) {
    console.error('Semantic analysis error:', error)
    throw new Error(`AI 분석 실패: ${error.message}`)
  }
}

/**
 * 프롬프트 빌더
 */
function buildPrompt(
  html: string,
  targetOption?: string,
  productName?: string
): string {
  let prompt = `다음은 상품 페이지의 HTML입니다.\n\n`

  if (productName) {
    prompt += `상품명: ${productName}\n`
  }

  if (targetOption) {
    prompt += `사용자가 원하는 옵션: ${targetOption}\n`
  }

  prompt += `\nHTML:\n${html.slice(0, 8000)}\n\n`

  prompt += `위 HTML을 분석하여 다음 JSON 형식으로 답변하세요:\n\n`
  prompt += `{\n`
  prompt += `  "is_restocked": boolean,  // 재입고 여부 (품절이 아니면 true)\n`
  prompt += `  "price": number | null,   // 가격 (숫자만, 없으면 null)\n`
  prompt += `  "option_available": boolean,  // 특정 옵션이 구매 가능한지 (targetOption이 있을 경우)\n`
  prompt += `  "confidence": number,     // 판단의 확신도 (0~1)\n`
  prompt += `  "reasoning": string       // 판단 근거 (선택 사항)\n`
  prompt += `}\n\n`

  if (targetOption) {
    prompt += `특히 "${targetOption}" 옵션이 구매 가능한지 확인하세요.\n`
  }

  prompt += `\n품절, 재입고 예정, 일시 품절, Out of Stock, Sold Out 등의 표시가 있으면 is_restocked는 false입니다.\n`
  prompt += `구매 가능, 장바구니 담기, Add to Cart, 재고 있음 등의 표시가 있으면 is_restocked는 true입니다.`

  return prompt
}

/**
 * 여러 페이지 분석 (배치 처리)
 */
export async function analyzeSemanticBatch(
  htmlPages: Array<{ html: string; options: SemanticAnalysisOptions }>,
  delayBetweenRequests: number = 1000
): Promise<SemanticAnalysisResult[]> {
  const results: SemanticAnalysisResult[] = []

  for (const page of htmlPages) {
    try {
      const result = await analyzeSemantic(page.html, page.options)
      results.push(result)

      // API 레이트 리밋 방지
      if (delayBetweenRequests > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests))
      }
    } catch (error: any) {
      results.push({
        is_restocked: false,
        price: null,
        option_available: false,
        confidence: 0,
        reasoning: `Error: ${error.message}`,
      })
    }
  }

  return results
}

/**
 * 크레딧 계산 (1회 분석 = 1 크레딧)
 */
export function calculateCreditsNeeded(analysisCount: number): number {
  return analysisCount
}

