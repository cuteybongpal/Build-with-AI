# Build-with-AI

남기미

냉장고 속 버리기 애매한 식재료들을 사용하기 위한 음식 추천 사이트입니다.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
- OpenAI SDK
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

## OpenAI

Next.js 서버 사이드에서 OpenAI Chat Completions API를 호출하도록 기본 연결 파일을 구성했습니다.

필수 환경변수:

```bash
OPENAI_API_KEY=sk-xxxxxxxx
OPENAI_MODEL=gpt-5-mini
```

호환 엔드포인트(Azure OpenAI, OpenRouter, 로컬 LLM 등)를 사용한다면 `OPENAI_BASE_URL`을 추가로 설정하세요.

### 상태 확인

```bash
GET /api/openai/status
```

응답 예시:

```json
{ "isConfigured": true, "model": "gpt-5-mini", "hasBaseUrl": false }
```

### 사용 예

```ts
import { getOpenaiText } from "@/shared/openai/openai-generate.query";

const text = await getOpenaiText({ prompt: "안녕" });
```
