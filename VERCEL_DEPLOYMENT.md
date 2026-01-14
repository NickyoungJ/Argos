# Vercel 배포 가이드

## 🚨 중요: Playwright 제한 사항

Vercel Serverless Functions는 **50MB 제한**이 있어 Playwright + Chromium (~300MB)을 사용할 수 없습니다.

---

## 🎯 해결 방법 (3가지 옵션)

### 옵션 1: Browserless.io (추천 ⭐⭐⭐)

**무료 티어:**
- 월 1,000 요청
- 충분한 테스트/개인 사용

**설정 순서:**

1. **Browserless 가입**
   ```
   https://www.browserless.io/
   → Sign Up (GitHub 계정으로)
   → Free 플랜 선택
   ```

2. **API 키 발급**
   ```
   Dashboard → API Keys
   → 키 복사
   ```

3. **환경변수 추가**
   ```env
   BROWSERLESS_API_KEY=your-key-here
   BROWSERLESS_URL=wss://chrome.browserless.io?token=your-key-here
   ```

4. **코드 수정 (자동 처리됨)**
   - Browserless URL이 있으면 자동으로 사용
   - 없으면 로컬 Playwright 사용

**비용:**
- Free: 1,000 requests/month
- Hobby: $29/month, 10,000 requests
- Pro: $99/month, 50,000 requests

---

### 옵션 2: Puppeteer-Core + Chrome AWS Lambda Layer

**장점:**
- ✅ Vercel에서 작동 가능
- ✅ 비용 무료

**단점:**
- ⚠️ 복잡한 설정
- ⚠️ 성능 제한

**설정:**
```bash
npm install puppeteer-core chrome-aws-lambda
```

---

### 옵션 3: 별도 스크래핑 서버

**Railway/Render에 별도 서버 배포**

**장점:**
- ✅ 제한 없음
- ✅ 완전한 제어

**단점:**
- ⚠️ 복잡한 아키텍처
- ⚠️ 추가 비용

---

## 📋 Vercel 배포 체크리스트

### 1️⃣ 환경변수 설정

**필수:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Inngest (Cloud)
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key
```

**선택 (기능별):**
```env
# OpenAI (Semantic 모드)
OPENAI_API_KEY=sk-...

# Browserless (스크래핑)
BROWSERLESS_API_KEY=...
BROWSERLESS_URL=wss://chrome.browserless.io?token=...

# Solapi (카카오/SMS)
SOLAPI_API_KEY=...
SOLAPI_API_SECRET=...
SOLAPI_SENDER_PHONE=...
SOLAPI_KAKAO_PF_ID=...

# Resend (이메일)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

---

### 2️⃣ Vercel 프로젝트 생성

**방법 A: Vercel Dashboard**
```
1. https://vercel.com/dashboard
2. "Add New" → "Project"
3. GitHub 연동
4. Repository 선택: NickyoungJ/Argos
5. "Import"
```

**방법 B: Vercel CLI**
```bash
npm i -g vercel
cd "/Users/nickyoung_j/아르고스"
vercel
```

---

### 3️⃣ 빌드 설정

**vercel.json (자동 생성됨)**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

---

### 4️⃣ 환경변수 입력

**Vercel Dashboard:**
```
Project Settings
→ Environment Variables
→ 위의 환경변수들 입력
→ Production / Preview / Development 선택
```

---

### 5️⃣ Inngest Cloud 연결

**Inngest Dashboard:**
```
1. https://app.inngest.com
2. "Apps" → "Create App"
3. App URL: https://your-app.vercel.app/api/inngest
4. "Sync"
5. Functions 6-7개 확인
```

---

### 6️⃣ 데이터베이스 마이그레이션

**Supabase Dashboard:**
```
1. SQL Editor 열기
2. 001_initial_schema.sql 실행
3. 002_add_target_selector.sql 실행
4. 확인: Tables 탭에서 users, monitors, logs 확인
```

---

## 🧪 배포 후 테스트

### 1. 기본 접속
```
https://your-app.vercel.app
→ 메인 페이지 로드 확인
```

### 2. 회원가입/로그인
```
https://your-app.vercel.app/auth
→ 새 계정 생성
```

### 3. 티어 업그레이드
```
https://your-app.vercel.app/admin/upgrade-user
→ 본인 이메일 PRO로 변경
```

### 4. 모니터 등록
```
https://your-app.vercel.app
→ 실제 쇼핑몰 URL 입력
→ 모니터 등록
```

### 5. Inngest 확인
```
https://app.inngest.com
→ Runs 탭
→ 1분 후 자동 실행 확인
```

---

## ⚠️ 주의사항

### 1. localhost URL 사용 불가
```
❌ http://localhost:3000/test-scraper/dummy
✅ https://www.coupang.com/vp/products/123456
```

### 2. Playwright 로컬 전용
```
로컬: Playwright ✅
Vercel: Browserless 또는 대체 방법 필요 ⚠️
```

### 3. 환경변수 누락
```
빌드 에러 → 환경변수 확인
런타임 에러 → Vercel Logs 확인
```

### 4. Cold Start
```
첫 요청: 느림 (5-10초)
이후 요청: 빠름 (<1초)
```

---

## 🐛 문제 해결

### 빌드 실패
```bash
# Vercel Dashboard → Deployments → 최근 배포 클릭
# Build Logs 확인
```

### 런타임 에러
```bash
# Vercel Dashboard → Deployments → Functions
# Runtime Logs 확인
```

### Inngest 연결 실패
```bash
# Inngest Dashboard → Apps
# App URL이 올바른지 확인
# https://your-app.vercel.app/api/inngest
```

---

## 💰 예상 비용

### 무료로 시작 가능:
- Vercel: Hobby 플랜 (무료)
- Supabase: Free 플랜 (500MB DB)
- Inngest: Free 플랜 (1,000 events/month)
- Browserless: Free 플랜 (1,000 requests/month)

### 유료 전환 시점:
- Vercel: 팀 협업 또는 더 많은 대역폭
- Supabase: 1GB+ DB 또는 더 많은 API 요청
- Inngest: 1,000+ events/month
- Browserless: 1,000+ requests/month

---

## 🚀 다음 단계

1. ✅ Browserless 가입 및 키 발급
2. ✅ Vercel 프로젝트 생성
3. ✅ 환경변수 설정
4. ✅ 배포 및 테스트
5. ⏳ 도메인 연결 (선택)
6. ⏳ 알림 서비스 연동
7. ⏳ 실제 사용자 테스트
