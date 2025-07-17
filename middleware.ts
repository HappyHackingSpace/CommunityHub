// middleware.ts - AUTH LOOP FIX
import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
 matcher: [
    '/files/:path*',
    '/dashboard/:path*',
    '/tasks/:path*',
    '/meetings/:path*',
    '/notifications/:path*',
    '/admin/:path*',
    '/permissions/:path*'
 ]
}