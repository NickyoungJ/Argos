# 🚫 NoMoreF5

> F5 새로고침은 그만! AI가 자동으로 재입고를 감지하여 알려드립니다

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

**품절 상품 재입고를 가장 빠르게 알려주는 AI 기반 모니터링 서비스**

## ✨ 주요 기능

- 🎯 **CSS Selector 영역 선택** - 페이지 전체가 아닌 특정 영역만 감시 (오알람 최소화)
- 👁️ **Visual Mode** - 빠른 해시 비교로 변화 감지
- 🤖 **Semantic Mode** - GPT-4를 활용한 정확한 의미 분석
- ⚡ **최대 1분 간격** - Pro 플랜에서 가장 빠른 체크
- 💬 **카카오톡 알림** - 이메일뿐만 아니라 카카오톡으로 즉시 알림
- 🛡️ **봇 차단 우회** - Stealth 기술로 안정적인 스크래핑

## 🏗️ 아키텍처

```
Frontend (Next.js 14)
    ↓
API Routes
    ↓
┌─────────────┬──────────────┬──────────────┐
│  Supabase   │   Playwright │   Inngest    │
│  (DB/Auth)  │  (Scraping)  │  (Queue)     │
└─────────────┴──────────────┴──────────────┘
    ↓               ↓               ↓
┌─────────────┬──────────────┬──────────────┐
│   OpenAI    │    Solapi    │   Resend     │
│  (AI 분석)  │  (카카오톡)   │   (이메일)    │
└─────────────┴──────────────┴──────────────┘
```

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS + Shadcn/UI
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth

## 프로젝트 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
SOLAPI_API_KEY=your_solapi_api_key
SOLAPI_API_SECRET=your_solapi_api_secret
SOLAPI_SENDER_PHONE=01012345678
RESEND_API_KEY=your_resend_api_key
```

### 3. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 파일의 내용을 실행합니다.
3. Supabase Dashboard에서 다음 설정을 확인합니다:
   - Authentication > Providers에서 이메일 인증 활성화
   - Authentication > Providers에서 전화번호(SMS) 인증 활성화

### 4. Inngest 설정

1. [Inngest](https://www.inngest.com)에서 계정을 생성합니다.
2. 새 앱을 만들고 Event Key와 Signing Key를 복사합니다.
3. 개발 서버 실행 후 `http://localhost:3000/api/inngest`에서 함수를 등록합니다.
4. Inngest Dashboard에서 Cron Job이 정상적으로 등록되었는지 확인합니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── auth/              # 인증 페이지
│   ├── dashboard/         # 대시보드 페이지
│   └── api/               # API Routes
├── components/            # React 컴포넌트
│   ├── auth/             # 인증 관련 컴포넌트
│   └── ui/               # UI 컴포넌트 (Shadcn/UI)
├── lib/                  # 유틸리티 및 설정
│   ├── scraper/          # 스크래핑 엔진
│   │   ├── fetch-html.ts      # Playwright HTML 페칭
│   │   ├── clean-html.ts      # HTML 전처리
│   │   ├── visual-analyzer.ts # Visual 분석
│   │   ├── semantic-analyzer.ts # AI 분석
│   │   ├── monitor.ts         # 통합 모니터링
│   │   └── utils.ts           # 유틸리티
│   ├── inngest/          # 작업 큐 시스템
│   │   ├── client.ts          # Inngest 클라이언트
│   │   ├── trigger.ts         # 이벤트 트리거
│   │   └── functions/         # 작업 함수
│   ├── supabase/         # Supabase 클라이언트
│   └── types/            # TypeScript 타입 정의
├── supabase/             # Supabase 마이그레이션
│   └── migrations/       # 데이터베이스 마이그레이션 파일
└── middleware.ts         # Next.js 미들웨어 (인증 체크)
```

## 개발 로드맵

### ✅ Phase 1: 환경 설정 및 인증 (완료)
- [x] Next.js 14 프로젝트 생성
- [x] Supabase Auth 연동
- [x] DB 테이블 생성
- [x] 인증 UI 구현

### ✅ Phase 2: 스크래퍼 엔진 구현 (완료)
- [x] Playwright 설정 및 Stealth 적용
- [x] 랜덤 딜레이 및 User-Agent 로테이션
- [x] HTML 전처리 (토큰 최적화)
- [x] Visual 분석 (해시 비교)
- [x] Semantic 분석 (OpenAI API)
- [x] 통합 모니터링 로직
- [x] 테스트 페이지 및 API

### ✅ Phase 3: 스케줄링 및 큐 (완료)
- [x] Inngest 클라이언트 설정
- [x] 모니터링 작업 함수 구현
- [x] Cron Job (1분/5분/30분 주기)
- [x] DB 연동 및 로그 저장
- [x] 크레딧 관리 및 자동 모드 전환
- [x] 실패 처리 및 자동 비활성화

### ✅ Phase 4: 비즈니스 로직 및 UI (완료)
- [x] 요금제별 제한 체크 로직
- [x] 모니터 CRUD API
- [x] 로그 조회 API
- [x] 모니터 추가/수정 폼 UI
- [x] 대시보드 모니터 목록
- [x] 로그 보기 UI
- [x] 요금제 업그레이드 UI (목업)

### ✅ Phase 5: 알림 시스템 (완료)
- [x] Solapi 카카오 알림톡/SMS 연동
- [x] Resend 이메일 연동
- [x] 메시지 템플릿 (텍스트/HTML)
- [x] 알림 우선순위 처리
- [x] Inngest 알림 함수
- [x] 알림 테스트 페이지

## 스크래퍼 테스트

개발 서버 실행 후:

1. `/test-scraper` 페이지 접속
2. Visual 또는 Semantic 모드 선택
3. 테스트할 URL 입력 또는 더미 페이지 사용
4. 테스트 실행

**더미 페이지**: `/test-scraper/dummy` - 로컬 테스트용 샘플 상품 페이지

## 스케줄링 시스템

Inngest를 통해 다음과 같은 주기로 자동 모니터링이 실행됩니다:

- **1분마다**: Pro 티어 모니터
- **5분마다**: Standard 티어 모니터  
- **30분마다**: Free 티어 모니터
- **매일 자정**: 로그 정리 및 유지보수

모니터링 작업은 다음 단계로 실행됩니다:
1. DB에서 활성 모니터 조회
2. 스크래핑 및 분석 실행
3. 크레딧 차감 (Semantic 모드)
4. 로그 저장
5. 변화 감지 시 알림 트리거

## 알림 시스템

재입고 감지 시 다음 우선순위로 알림이 발송됩니다:

### 발송 우선순위
1. **카카오 알림톡** (Standard/Pro 티어)
2. **SMS** (카카오 알림톡 실패 시)
3. **이메일** (최후 수단 또는 Free 티어)

### 티어별 알림 채널
- **Free**: 이메일만
- **Standard/Pro**: 카카오 알림톡/SMS + 이메일

### 알림 테스트
`/test-notification` 페이지에서 알림 발송을 테스트할 수 있습니다.

## 주요 기능

### 인증
- 이메일/비밀번호 로그인 및 회원가입
- 전화번호 인증 (SMS OTP) - 카카오톡 알림을 위해 필수

### 데이터베이스 스키마
- **users**: 사용자 정보 및 요금제
- **monitors**: 감시 작업 설정
- **logs**: 감시 이력

## 라이선스

Private

