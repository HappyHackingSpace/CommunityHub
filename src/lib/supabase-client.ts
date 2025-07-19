// src/lib/supabase-client.ts
import { createBrowserClient, createServerClient } from '@supabase/ssr'

// Browser client - safe to use anywhere
export function createClient() {
  // Debug and fix storage corruption before creating client
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const supabaseCookies = cookies.filter(c => c.includes('supabase'))
    const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
    const storedSession = localStorage.getItem(storageKey)
    
    console.log('🔍 Supabase: Pre-client debug:', {
      hasCookies: supabaseCookies.length > 0,
      hasStorage: !!storedSession,
      storageKey
    })
    
    // If we have cookies but no localStorage, clear localStorage to force resync
    if (supabaseCookies.length > 0 && !storedSession) {
      console.log('🔧 Supabase: Detected storage corruption, clearing localStorage...')
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key)
          console.log('🗑️ Supabase: Cleared localStorage key:', key)
        }
      })
    }
  }
  
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        debug: process.env.NODE_ENV === 'development'
      }
    }
  )
  
  // Debug storage state in development
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    console.log('🔍 Supabase: Client storage debug:', {
      hasLocalStorage: !!window.localStorage,
      supabaseKeys: Object.keys(window.localStorage).filter(k => k.includes('supabase')),
      storageItems: Object.keys(window.localStorage).filter(k => k.includes('supabase')).reduce((acc, key) => {
        acc[key] = window.localStorage.getItem(key)?.length || 0
        return acc
      }, {} as Record<string, number>)
    })
  }
  
  return client
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