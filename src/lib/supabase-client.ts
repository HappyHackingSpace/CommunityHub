// src/lib/supabase-client.ts
import { createBrowserClient, createServerClient } from '@supabase/ssr'

// Browser client - safe to use anywhere
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server client for API routes (without next/headers dependency)
export function createServerClientForAPI(req: any, res: any) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies || {}).map(name => ({
            name,
            value: req.cookies[name]
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options?.httpOnly ? 'HttpOnly; ' : ''}${options?.secure ? 'Secure; ' : ''}`)
          })
        },
      },
    }
  )
}