import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // /auth 페이지는 로그인하지 않은 사용자만 접근 가능
  if (req.nextUrl.pathname.startsWith('/auth')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return res
  }

  // /dashboard 페이지는 로그인한 사용자만 접근 가능
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }
    return res
  }

  // /api/monitors 등 보호된 API는 로그인 필요
  if (req.nextUrl.pathname.startsWith('/api/monitors')) {
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }
    return res
  }

  return res
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/dashboard/:path*',
    '/api/monitors/:path*',
  ],
}

