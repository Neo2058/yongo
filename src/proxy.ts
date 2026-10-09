import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "yongo_session"

function cspValue(nonce: string) {
  const isDev = process.env.NODE_ENV === "development"
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "media-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ")
}

function applySecurityHeaders(response: NextResponse, nonce: string, pathname: string) {
  response.headers.set("Content-Security-Policy", cspValue(nonce))
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/briefing") ||
    pathname.startsWith("/gate") ||
    pathname.startsWith("/i/") ||
    pathname.startsWith("/media/")
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow")
    response.headers.set("Cache-Control", "private, no-store")
    response.headers.set("Referrer-Policy", "no-referrer")
  }
  return response
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const { pathname } = request.nextUrl

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", cspValue(nonce))

  if (pathname.startsWith("/dashboard") && pathname !== "/dashboard/login") {
    const session = request.cookies.get(SESSION_COOKIE)?.value
    if (!session) {
      const login = NextResponse.redirect(new URL("/dashboard/login", request.url))
      return applySecurityHeaders(login, nonce, pathname)
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  return applySecurityHeaders(response, nonce, pathname)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
}
