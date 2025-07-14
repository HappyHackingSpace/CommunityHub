// src/middleware.ts - YENİ DOSYA OLUŞTUR
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ✅ Admin-only routes
  const adminRoutes = ['/permissions'];
  
  // ✅ Club leader + Admin routes  
  const leaderRoutes = ['/settings'];
  
  // ✅ Token'ı kontrol et
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // ✅ Public routes - auth gerekmez
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/register'];
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // ✅ Token yoksa login'e yönlendir
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // ✅ Admin route kontrolü
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // TODO: Token'dan role çıkar ve admin kontrolü yap
    // Şimdilik geç, çünkü JWT decode gerekiyor
  }
  
  return NextResponse.next();
}

// ✅ Middleware config
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}