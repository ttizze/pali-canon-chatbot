// middleware.ts (Next.js 13+/App Router)
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");
  if (basicAuth) {
    const [, encoded] = basicAuth.split(" ");
    const [user, pass] = atob(encoded).split(":");

    if (
      user === process.env.BASIC_AUTH_USER &&
      pass === process.env.BASIC_AUTH_PASS
    ) {
      return NextResponse.next(); // 認証 OK
    }
  }

  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Protected"' },
  });
}

export const config = {
  // _next や静的アセットを除外
  matcher: ["/((?!_next|favicon.ico).*)"],
} 