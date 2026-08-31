import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "yongo_session"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === "/dashboard/login") return NextResponse.next()
  if (!pathname.startsWith("/dashboard")) return NextResponse.next()

  const session = request.cookies.get(SESSION_COOKIE)?.value
  if (!session) {
    const login = new URL("/dashboard/login", request.url)
    return NextResponse.redirect(login)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
}
