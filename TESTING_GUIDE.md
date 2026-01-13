# NoMoreF5 테스트 가이드

## 🧪 로컬 테스트 (개발용)

### 방법 1: 수동 스크래퍼 테스트
```
http://localhost:3000/test-scraper

✅ 브라우저에서 직접 실행
✅ localhost 더미 페이지 테스트 가능
✅ Inngest 없이 즉시 결과 확인
```

### 방법 2: 네트워크 IP 사용
```bash
# 1. IP 확인
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. 출력 예시
inet 192.168.123.102

# 3. 모니터 등록 시 사용
http://192.168.123.102:3000/test-scraper/dummy
```

---

## 🌐 실전 테스트 (권장)

### 실제 쇼핑몰 사이트로 테스트

**1. 쿠팡 (재입고 알림 많음)**
```
https://www.coupang.com/vp/products/상품번호
```

**2. 무신사 (인기 상품 품절 많음)**
```
https://www.musinsa.com/products/상품번호
```

**3. 29CM (한정판 많음)**
```
https://www.29cm.co.kr/products/상품번호
```

---

## ✅ 테스트 시나리오

### 시나리오 1: Visual 모드 (빠름)
```
1. 실제 쇼핑몰 상품 URL 입력
2. Load Preview
3. 가격 영역 선택
4. Mode: Visual
5. Frequency: 1분 (PRO 티어)
6. Start Monitoring
7. 1분 후 Inngest UI에서 확인
```

### 시나리오 2: Semantic 모드 (AI)
```
1. 실제 쇼핑몰 상품 URL 입력
2. Load Preview
3. 전체 페이지 또는 큰 영역 선택
4. Mode: Semantic (AI)
5. Frequency: 5분
6. Start Monitoring
7. 5분 후 Inngest UI에서 확인
```

---

## 🐛 문제 해결

### localhost 접근 불가
- ❌ `http://localhost:3000/test-scraper/dummy`
- ✅ `http://192.168.x.x:3000/test-scraper/dummy`
- ✅ 실제 공개 사이트 URL

### Playwright 에러
```bash
npx playwright install chromium
```

### OpenAI API 키 없음 (Semantic 모드)
```bash
# .env.local에 추가
OPENAI_API_KEY=sk-your-key-here
```

---

## 📊 모니터링 확인

### Inngest UI
```
http://localhost:8288
→ Runs 탭
→ 최근 실행 확인
→ 로그 확인
```

### 대시보드
```
http://localhost:3000/dashboard
→ 내 모니터 목록
→ 로그 확인
```

---

## 🎯 다음 단계

1. ✅ 로컬 테스트 완료
2. ⏳ 알림 서비스 연동 (Solapi/Resend)
3. ⏳ Vercel 배포
4. ⏳ 실제 사용자 테스트
