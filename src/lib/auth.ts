// src/lib/auth.ts
import { createClient } from '@/utils/supabase/server'
import { createClient as createBrowserClient } from '@/utils/supabase/client'

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'club_leader' | 'member';
  isActive: boolean;
}

export class AuthService {
  static async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get user details from custom users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      return null
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isActive: userData.is_active,
    }
  }

  static async signInWithPassword(email: string, password: string) {
    const supabase = createBrowserClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      throw new Error(error?.message || 'Giriş başarısız')
    }

    return data
  }

  static async signUp(email: string, password: string, name: string) {
    const supabase = createBrowserClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async signOut() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
  }
}