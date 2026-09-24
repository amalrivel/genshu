import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

const prototypePaths = ["/attendance", "/assignments", "/exams", "/cohorts", "/users"]

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (process.env.NODE_ENV === "production" && prototypePaths.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    return NextResponse.redirect(new URL("/materials", request.url))
  }
  if (pathname === "/login" || pathname === "/staff" || pathname.startsWith("/staff/")) {
    return updateSession(request)
  }
  return NextResponse.next({ request })
}

export const config = {
  matcher: ["/login", "/staff/:path*", "/attendance/:path*", "/assignments/:path*", "/exams/:path*", "/cohorts/:path*", "/users/:path*"],
}
