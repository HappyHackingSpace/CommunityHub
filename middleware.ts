// middleware.ts - AUTH LOOP FIX
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 🚀 CRITICAL: Get user session without side effects
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 🔥 FIX: Define exact public routes (prevent auth loops)
  const publicRoutes = ['/login', '/register', '/auth/confirm', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // 🔥 FIX: API routes should not redirect (prevent fetch loops)
  const isApiRoute = pathname.startsWith('/api/')
  
  // 🔥 FIX: Static assets should not redirect
  const isStaticAsset = pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)

  // ✅ Allow access to public routes, API routes, and static assets
  if (isPublicRoute || isApiRoute || isStaticAsset) {
    return supabaseResponse
  }

  // 🔥 FIX: If no user and accessing protected route, redirect to login
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname) // Preserve intended destination
    return NextResponse.redirect(loginUrl)
  }

  // 🔥 FIX: If user exists but accessing root, redirect to dashboard
  if (user && pathname === '/') {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // ✅ All good, proceed with request
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .next (Next.js internals)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}