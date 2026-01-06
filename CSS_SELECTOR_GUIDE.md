# CSS Selector 기능 가이드

## 🎯 개요

**CSS Selector 기능**은 페이지 전체가 아닌 특정 영역만 감시하여 **오알람을 대폭 감소**시키는 핵심 기능입니다.

## 💡 왜 필요한가요?

### 기존 방식의 문제점
```
전체 페이지 감시 → 광고, 추천 상품, 시간 등 모든 변화에 반응 → 오알람 多
```

### CSS Selector 방식
```
사용자가 지정한 영역만 감시 → 가격, 재고 등 원하는 정보만 추적 → 정확한 알림 ✓
```

## 🚀 사용 방법

### 1. 메인 페이지에서 URL 입력
```
1. URL 입력 → "Go" 클릭
2. 페이지 프리뷰 확인
```

### 2. 감시 영역 선택
```
1. 오른쪽 설정 패널에서 "🎯 영역 선택하기" 클릭
2. 모달이 열리면 페이지에서 감시할 영역에 마우스 올리기
3. 원하는 영역 클릭 (예: 가격 영역, 재고 상태)
4. "이 영역 감시하기" 버튼 클릭
```

### 3. 모니터링 시작
```
1. 감시 모드 선택 (Visual 또는 Semantic)
2. 기타 설정 완료
3. "Start Monitoring" 클릭
```

## 🔄 동작 방식

### Visual Mode + CSS Selector
```typescript
1. CSS Selector로 영역 추출
2. 해당 영역의 HTML 해시 계산
3. 이전 해시와 비교
4. 변화 시 알림
```

**장점:**
- ✓ 무료
- ✓ 빠름
- ✓ 오알람 감소
- ✓ 크레딧 불필요

### Semantic Mode + CSS Selector
```typescript
1. CSS Selector로 영역 추출
2. 해당 영역의 HTML만 GPT에 전달
3. AI가 의미 분석 (예: "사이즈 270 재입고 여부")
4. 조건 만족 시 알림
```

**장점:**
- ✓ 매우 정확함
- ✓ 복잡한 조건 이해 가능
- ✓ 토큰 사용량 감소 (전체 페이지 대비)

**단점:**
- ✗ 크레딧 소모 (Pro 전용)

## 📊 비교표

| 방식 | 정확도 | 속도 | 비용 | 오알람 |
|------|--------|------|------|--------|
| 전체 + Visual | ⭐⭐ | 빠름 | 무료 | 많음 |
| Selector + Visual | ⭐⭐⭐⭐ | 빠름 | 무료 | 적음 |
| 전체 + Semantic | ⭐⭐⭐⭐ | 느림 | 크레딧 | 중간 |
| Selector + Semantic | ⭐⭐⭐⭐⭐ | 느림 | 크레딧 | 매우 적음 |

## 🛠️ 기술 상세

### CSS Selector 생성 알고리즘
```typescript
// lib/utils/selector.ts
export function generateOptimalSelector(element: Element): string {
  // 1. ID 우선 (#unique-id)
  // 2. Class 사용 (.price-area)
  // 3. nth-of-type으로 고유성 보장
  // 4. body까지 상위 경로 추적
}
```

### 데이터베이스
```sql
-- monitors 테이블
ALTER TABLE monitors ADD COLUMN target_selector TEXT;

-- 예시
target_selector: ".product-price > .current-price"
```

### API
```typescript
// POST /api/monitors
{
  url: "https://example.com/product",
  product_name: "나이키 신발",
  target_selector: ".price-info",  // 선택사항
  mode: "VISUAL",
  frequency: 30
}
```

## 💰 요금제별 지원

### Free
- ✓ CSS Selector 사용 가능
- ✓ Visual Mode만
- ✓ 30분 간격

### Standard
- ✓ CSS Selector 사용 가능
- ✓ Visual Mode만
- ✓ 5분 간격

### Pro
- ✓ CSS Selector 사용 가능
- ✓ Visual + Semantic Mode
- ✓ 1분 간격
- ✓ AI 크레딧 월 100개

## 🎨 UI 컴포넌트

### ElementSelector
```typescript
// components/selector/element-selector.tsx
<ElementSelector
  url={url}
  onSelect={(selector, preview) => {
    // selector: ".product-price"
    // preview: "7억 1,000만원"
  }}
  onCancel={() => {}}
/>
```

**기능:**
- iframe 내부 요소에 이벤트 리스너 추가
- 마우스 호버 시 하이라이트
- 클릭 시 CSS Selector 자동 생성
- 선택된 요소 미리보기

## 🔧 트러블슈팅

### "선택한 영역을 찾을 수 없습니다"
**원인:** 페이지 구조가 변경되어 CSS Selector가 무효화됨

**해결:**
1. 모니터 수정
2. 영역 다시 선택
3. 업데이트

### Selector가 너무 복잡함
**원인:** 동적으로 생성된 요소의 class가 복잡함

**해결:** 괜찮습니다. 고유성만 보장되면 작동합니다.

### 여러 영역을 선택하고 싶음
**현재:** 1개 영역만 선택 가능

**향후 계획:** v2에서 다중 영역 선택 지원 예정

## 📝 예시 시나리오

### 시나리오 1: 아파트 가격 감시
```
1. 네이버 부동산 URL 입력
2. "가격" 영역 선택 (.price-area)
3. Visual Mode로 모니터링
4. 가격 변동 시 즉시 알림
```

### 시나리오 2: 신발 재입고 감시
```
1. 나이키 상품 URL 입력
2. "사이즈 선택" 영역 선택 (.size-selector)
3. Semantic Mode 선택
4. Target Option: "270" 입력
5. 사이즈 270 재입고 시 알림
```

## 🚀 성능 최적화

### Visual Mode
- HTML 크기 감소: 전체 페이지 → 선택 영역
- 해시 계산 속도 향상
- 스크래핑 시간 단축

### Semantic Mode
- 토큰 사용량 감소: 평균 80% 절감
- AI 응답 속도 향상
- 비용 절감 효과

## 📚 관련 파일

- `lib/utils/selector.ts` - CSS Selector 유틸리티
- `components/selector/element-selector.tsx` - UI 컴포넌트
- `lib/scraper/focused-analyzer.ts` - 영역별 분석기
- `lib/scraper/monitor.ts` - 통합 모니터링 로직
- `supabase/migrations/002_add_target_selector.sql` - DB 마이그레이션

---

**버전:** 1.0.0  
**마지막 업데이트:** 2025-01-05

