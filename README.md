# Build-with-AI

남기미

냉장고 속 버리기 애매한 식재료들을 사용하기 위한 음식 추천 사이트입니다.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
- Google Gen AI SDK for Vertex AI
- Auth.js / NextAuth Google OAuth
- Prisma + PostgreSQL

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run db:generate
npm run db:push
```

## Auth and Database

Google 로그인과 사용자별 식재료/도구 저장을 위해 PostgreSQL을 사용합니다.

필수 환경변수:

```bash
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

로컬에서 Prisma Client를 생성하고 스키마를 반영합니다.

```bash
npm run db:generate
npm run db:push
```

`prisma/schema.prisma`에는 Auth.js 기본 테이블과 사용자별 식재료,
보유 도구 테이블이 포함되어 있습니다.

## Vertex AI

Next.js 서버 사이드에서 Vertex AI를 호출하도록 기본 연결 파일을 구성했습니다. 두 가지 인증 모드를 지원합니다.

### 모드 A — Vertex AI Express Mode (API 키)

```bash
GOOGLE_API_KEY=AQ.xxxxxxxx
VERTEX_AI_MODEL=gemini-2.5-flash
```

`GOOGLE_API_KEY`가 설정되어 있으면 자동으로 Express Mode가 선택됩니다.
가장 간단하게 시작할 수 있는 방식입니다.

### 모드 B — Application Default Credentials (project + location)

```bash
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-2.5-flash
GOOGLE_APPLICATION_CREDENTIALS=
```

`GOOGLE_API_KEY`가 비어 있으면 ADC가 사용됩니다. 로컬에서는 `gcloud auth application-default login`을 사용하거나 `GOOGLE_APPLICATION_CREDENTIALS`에 서비스 계정 키 파일 경로를 지정합니다.

### 상태 확인

```bash
GET /api/vertex-ai/status
```

응답 예시:

```json
{ "isConfigured": true, "authMode": "api-key", "model": "gemini-2.5-flash" }
```
