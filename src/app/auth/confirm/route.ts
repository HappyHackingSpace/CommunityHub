// src/app/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // User is now verified, create profile if doesn't exist
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user profile exists in custom table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!existingUser) {
          // Create user profile
          await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              role: 'member',
              is_active: true,
            })
        }
      }

      // redirect user to specified redirect URL or dashboard
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // redirect the user to an error page with instructions
  return NextResponse.redirect(new URL('/error', request.url))
}