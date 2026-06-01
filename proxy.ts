import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createProxyClient } from "@/lib/supabase-proxy";

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (!path.startsWith("/admin") || path === "/admin/login") {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createProxyClient(req, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
