import { createBrowserClient, createServerClient } from '@supabase/ssr'


export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,     
        autoRefreshToken: true,    
        detectSessionInUrl: true,  
        storage: undefined,        
        debug: false  // Disable GoTrueClient debug logs
      }
    }
  )
  
 
  return client
}


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