export { auth as middleware } from "@/auth";

export const config = {
  // 로그인 페이지, API, 정적 파일은 미들웨어에서 제외
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
