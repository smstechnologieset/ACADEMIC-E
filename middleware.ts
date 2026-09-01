import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect admin routes except login
  if (path.startsWith("/admin") && path !== "/admin/login") {
    const sessionCookie = request.cookies.get("academic_admin_session");

    // Also check for Supabase auth token cookie if present
    const hasSbCookie = Array.from(request.cookies.getAll()).some(
      (c) => c.name.includes("sb-") && c.name.includes("-auth-token")
    );

    if (!sessionCookie && !hasSbCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
