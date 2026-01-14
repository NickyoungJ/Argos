# 🚀 Vercel 배포 체크리스트

## 📋 배포 전 준비 (30분)

### 1️⃣ Browserless 계정 생성
```
□ https://www.browserless.io/ 접속
□ Sign Up (GitHub 계정 추천)
□ Free 플랜 선택
□ API Key 복사
□ BROWSERLESS_URL 복사
   wss://chrome.browserless.io?token=YOUR_TOKEN
```

---

### 2️⃣ Vercel 프로젝트 생성
```
□ https://vercel.com/ 접속
□ GitHub 계정 연동
□ "New Project" 클릭
□ Repository: NickyoungJ/Argos 선택
□ "Import" 클릭
```

---

### 3️⃣ 환경변수 설정

**Vercel Dashboard → Settings → Environment Variables**

#### 필수 환경변수:
```
□ NEXT_PUBLIC_SUPABASE_URL
□ NEXT_PUBLIC_SUPABASE_ANON_KEY
□ SUPABASE_SERVICE_ROLE_KEY
□ INNGEST_EVENT_KEY
□ INNGEST_SIGNING_KEY
□ BROWSERLESS_URL
```

#### 선택 환경변수:
```
□ OPENAI_API_KEY (Semantic 모드 사용 시)
□ SOLAPI_API_KEY (카카오 알림 사용 시)
□ SOLAPI_API_SECRET
□ SOLAPI_SENDER_PHONE
□ RESEND_API_KEY (이메일 알림 사용 시)
□ RESEND_FROM_EMAIL
```

---

### 4️⃣ 배포 실행
```
□ "Deploy" 버튼 클릭
□ 빌드 완료 대기 (2-3분)
□ 배포 URL 확인
   https://your-app.vercel.app
```

---

## 🧪 배포 후 테스트 (20분)

### 5️⃣ 기본 기능 테스트
```
□ 메인 페이지 접속
   https://your-app.vercel.app
□ 회원가입/로그인
   https://your-app.vercel.app/auth
□ 티어 업그레이드
   https://your-app.vercel.app/admin/upgrade-user
□ 대시보드 접속
   https://your-app.vercel.app/dashboard
```

---

### 6️⃣ Inngest 연결
```
□ Inngest Dashboard 접속
   https://app.inngest.com
□ Apps → Create App
□ App URL 입력:
   https://your-app.vercel.app/api/inngest
□ "Sync" 클릭
□ Functions 6-7개 확인
```

---

### 7️⃣ 모니터링 테스트
```
□ 실제 쇼핑몰 URL로 모니터 등록
   예: https://www.coupang.com/vp/products/123456
□ 영역 선택
□ "Start Monitoring" 클릭
□ Inngest Runs에서 1분 후 확인
   https://app.inngest.com → Runs 탭
□ 대시보드에서 로그 확인
   https://your-app.vercel.app/dashboard
```

---

## ⚠️ 문제 해결

### 빌드 실패
```
□ Vercel Dashboard → Deployments → 실패한 배포 클릭
□ Build Logs 확인
□ 환경변수 누락 확인
□ 재배포 시도
```

### Browserless 연결 실패
```
□ BROWSERLESS_URL 형식 확인
   wss://chrome.browserless.io?token=YOUR_TOKEN
□ Browserless Dashboard에서 사용량 확인
□ 무료 한도 (1,000 requests) 초과 확인
```

### Inngest 연결 실패
```
□ App URL이 올바른지 확인
□ /api/inngest 엔드포인트 직접 접속 테스트
□ INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY 확인
□ Vercel Functions 로그 확인
```

---

## 📊 모니터링

### Vercel Logs
```
Dashboard → Deployments → Functions
→ Runtime Logs 확인
```

### Inngest Runs
```
https://app.inngest.com
→ Runs 탭
→ 실행 로그 확인
```

### Supabase Logs
```
Supabase Dashboard
→ Logs → API
→ 쿼리 로그 확인
```

---

## 🎉 배포 완료!

```
✅ Vercel 배포 성공
✅ Inngest 연결 성공
✅ 모니터링 테스트 성공
✅ 실제 사이트 스크래핑 작동
```

---

## 💰 무료 티어 한도

### Vercel (Hobby)
- 100GB 대역폭/월
- 6,000 실행 시간/월
- 충분함 ✅

### Supabase (Free)
- 500MB 데이터베이스
- 50,000 MAU
- 충분함 ✅

### Inngest (Free)
- 1,000 events/월
- 초과 시: $5/1,000 events
- 주의 필요 ⚠️

### Browserless (Free)
- 1,000 requests/월
- 초과 시: $29/월
- 주의 필요 ⚠️

---

## 🚀 다음 단계

```
□ 커스텀 도메인 연결
□ 알림 서비스 테스트
□ 실제 사용자 초대
□ 사용량 모니터링
□ 유료 플랜 고려
```
