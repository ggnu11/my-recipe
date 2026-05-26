import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route protection — will integrate Supabase auth in Phase 6
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // TODO: Check Supabase session
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
