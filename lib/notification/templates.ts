/**
 * 알림 메시지 템플릿
 */

export interface NotificationData {
  productName: string
  targetOption?: string
  url: string
  price?: number
  timestamp: string
}

/**
 * SMS/알림톡 텍스트 템플릿
 */
export function getTextTemplate(data: NotificationData): string {
  const lines = [
    '[재입고 알림]',
    `상품명: ${data.productName}`,
  ]

  if (data.targetOption) {
    lines.push(`옵션: ${data.targetOption}`)
  }

  if (data.price) {
    lines.push(`가격: ${data.price.toLocaleString()}원`)
  }

  lines.push(`시간: ${data.timestamp}`)
  lines.push(`바로가기: ${data.url}`)

  return lines.join('\n')
}

/**
 * 이메일 HTML 템플릿
 */
export function getEmailTemplate(data: NotificationData): {
  subject: string
  html: string
} {
  const subject = `[재입고 알림] ${data.productName}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #2563eb;
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .alert-badge {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .info-row {
      margin: 15px 0;
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 6px;
    }
    .info-label {
      font-weight: bold;
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 16px;
      color: #111827;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: bold;
      margin-top: 20px;
    }
    .cta-button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      padding: 20px 30px;
      background-color: #f9fafb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 재입고 알림</h1>
    </div>
    <div class="content">
      <div class="alert-badge">✓ 재입고 감지됨</div>
      
      <div class="info-row">
        <div class="info-label">상품명</div>
        <div class="info-value">${data.productName}</div>
      </div>
      
      ${data.targetOption ? `
      <div class="info-row">
        <div class="info-label">옵션</div>
        <div class="info-value">${data.targetOption}</div>
      </div>
      ` : ''}
      
      ${data.price ? `
      <div class="info-row">
        <div class="info-label">가격</div>
        <div class="info-value">${data.price.toLocaleString()}원</div>
      </div>
      ` : ''}
      
      <div class="info-row">
        <div class="info-label">감지 시간</div>
        <div class="info-value">${data.timestamp}</div>
      </div>
      
      <a href="${data.url}" class="cta-button">상품 페이지로 이동 →</a>
    </div>
    <div class="footer">
      <p>이 메일은 Restock Alert 서비스에서 자동으로 발송되었습니다.</p>
      <p>알림 설정을 변경하려면 대시보드를 방문하세요.</p>
    </div>
  </div>
</body>
</html>
  `

  return { subject, html }
}

/**
 * 카카오 알림톡 변수 매핑
 */
export function getKakaoVariables(data: NotificationData): Record<string, string> {
  return {
    product_name: data.productName,
    target_option: data.targetOption || '-',
    price: data.price ? `${data.price.toLocaleString()}원` : '-',
    timestamp: data.timestamp,
    url: data.url,
  }
}

