// middleware.ts - AUTH LOOP FIX
import { updateSession } from '@/utils/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
   return await updateSession(request)
  } catch (error) {
   console.error('Middleware error:', error)
   // Return a response that redirects to login on error
   const url = request.nextUrl.clone()
   url.pathname = '/login'
   return NextResponse.redirect(url)  }
}

export const config = {
 matcher: [
    '/login',
    '/files/:path*',
    '/dashboard/:path*',
    '/tasks/:path*',
    '/meetings/:path*',
    '/notifications/:path*',
    '/admin/:path*',
    '/permissions/:path*'
 ]
}