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

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
```

## Vertex AI

Next.js 서버 사이드에서 Vertex AI를 호출하도록 기본 연결 파일을 구성했습니다.

필요한 환경변수는 `.env.example`을 기준으로 설정합니다.

```bash
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-2.5-flash
GOOGLE_APPLICATION_CREDENTIALS=
```

로컬에서는 Google Application Default Credentials를 사용합니다.
서비스 계정 키 파일을 쓸 경우 `GOOGLE_APPLICATION_CREDENTIALS`에 경로를 넣습니다.

설정 여부 확인 경로:

```bash
GET /api/vertex-ai/status
```
