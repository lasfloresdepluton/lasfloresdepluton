import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect /admin routes — only check authentication here.
  // Role verification (admin check) is handled by the admin layout using the
  // service-role client, which bypasses RLS and can reliably read the profile.
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }
  }

  // Protect /cuenta routes — must be authenticated
  if (request.nextUrl.pathname.startsWith('/cuenta')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=/cuenta', request.url))
    }
  }

  // Redirect authenticated users away from login/registro
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro') && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/cuenta/:path*', '/login', '/registro'],
}
