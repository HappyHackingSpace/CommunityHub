// middleware.ts - ROOT LEVEL (src klasörü ile aynı seviyede)
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

  const { pathname } = request.nextUrl

  // 🚀 Public routes (no auth required)
  const publicRoutes = ['/login', '/auth/confirm', '/auth/callback', '/register']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // ✅ Allow public routes
  if (isPublicRoute) {
    return supabaseResponse
  }

  // 🚀 FIX: Check for auth cookies first (faster than API call)
  const authCookies = request.cookies.getAll().filter(cookie => 
    cookie.name.includes('supabase') || 
    cookie.name.includes('auth') ||
    cookie.name.includes('sb-')
  )

  // If no auth cookies, redirect immediately
  if (authCookies.length === 0 && pathname !== '/') {
    console.log('🔒 Middleware: No auth cookies, redirecting to login from:', pathname)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  try {
    // IMPORTANT: Auth check with timeout
    const authPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), 2000)
    )

   try {
  const { data: { user } } = await supabase.auth.getUser()
  
  // ✅ FIX: If user exists and on login page, redirect to dashboard
  if (user && (pathname === '/login' || pathname === '/')) {
    console.log('✅ Middleware: User logged in, redirecting to dashboard')
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

    // ❌ Redirect to login if no user and accessing protected route
    if (!user && pathname !== '/') {
      console.log('🔒 Middleware: No user, redirecting to login from:', pathname)
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // ✅ If user exists and on login page, redirect to dashboard
    if (user && pathname === '/login') {
      console.log('✅ Middleware: User logged in, redirecting to dashboard')
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // ✅ User exists, continue
    return supabaseResponse

  } catch (error) {
    console.log('⚠️ Middleware: Auth check failed:', error)
  }
    
    // If auth check fails but we have cookies, allow through
    // (let client-side handle the auth)
    if (authCookies.length > 0) {
      return supabaseResponse
    }
    
    // No cookies and auth failed, redirect to login
    if (pathname !== '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}