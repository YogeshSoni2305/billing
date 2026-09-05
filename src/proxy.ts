import { NextResponse, type NextRequest } from 'next/server'
import { verifyJWT, AUTH_COOKIE_NAME } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files, _next internal assets, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(png|jpg|jpeg|svg|css|js|ico)$/)
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const payload = token ? await verifyJWT(token) : null
  const isLoginPage = pathname === '/login'

  // 1. Unauthenticated user accessing protected route -> redirect to /login
  if (!payload && !isLoginPage) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Authenticated user accessing /login -> redirect to home dashboard /
  if (payload && isLoginPage) {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const middleware = proxy

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
