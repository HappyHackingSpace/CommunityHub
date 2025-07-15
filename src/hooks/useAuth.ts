// src/hooks/useAuth.ts - LOGOUT FIX
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'club_leader' | 'member';
  isActive: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      console.log('🔍 Getting initial session...')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user && mounted) {
        console.log('👤 Session user found:', session.user.id)
        await fetchUserProfile(session.user)
      } else {
        console.log('❌ No session found')
      }
      
      if (mounted) {
        setLoading(false)
        setInitialized(true)
      }
    }

    async function fetchUserProfile(authUser: User) {
      console.log('🔍 Fetching user profile for:', authUser.id)
      
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .eq('is_active', true)
          .single()

        if (userData && mounted) {
          console.log('✅ User profile found:', userData)
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            isActive: userData.is_active,
          })
        } else if (error?.code === 'PGRST116') {
          console.log('🔄 Creating user profile for:', authUser.email)
          await createUserProfile(authUser)
        } else {
          console.error('❌ User profile fetch error:', error)
          setUser(null)
        }
      } catch (error) {
        console.error('💥 Error fetching user profile:', error)
        if (mounted) {
          setUser(null)
        }
      }
    }

    async function createUserProfile(authUser: User) {
      try {
        let role: 'admin' | 'club_leader' | 'member' = 'member'
        if (authUser.email === 'admin@happyhackingspace.com') {
          role = 'admin'
        } else if (authUser.email?.includes('leader') || authUser.email?.includes('club')) {
          role = 'club_leader'
        }

        const newUserData = {
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          role: role,
          is_active: true,
          permissions: role === 'admin' ? [
            { name: 'MANAGE_USERS', granted_at: new Date().toISOString(), granted_by: 'system' },
            { name: 'ADMIN_PANEL_ACCESS', granted_at: new Date().toISOString(), granted_by: 'system' },
          ] : []
        }

        console.log('🔄 Creating user profile:', newUserData)

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert(newUserData)
          .select()
          .single()

        if (createError) {
          console.error('❌ Failed to create user profile:', createError)
          return
        }

        console.log('✅ User profile created:', createdUser)

        if (mounted) {
          setUser({
            id: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
            role: createdUser.role,
            isActive: createdUser.is_active,
          })
        }
      } catch (error) {
        console.error('💥 Error creating user profile:', error)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event)
        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in:', session.user.id)
          await fetchUserProfile(session.user)
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          setUser(null)
          // ✅ LOGOUT FIX: Hemen login'e yönlendir
          router.push('/login')
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const logout = async () => {
    console.log('👋 Logging out...')
    try {
      await supabase.auth.signOut()
      setUser(null)
      // ✅ DOUBLE SAFETY: Logout fonksiyonundan da yönlendir
      router.push('/login')
      // ✅ FORCE REFRESH: Sayfayı yenile
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Hata olsa bile login'e yönlendir
      window.location.href = '/login'
    }
  }

  return {
    user,
    isLoading: loading,
    initialized,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLeader: user?.role === 'club_leader',
    isMember: user?.role === 'member',
    logout,
  }
}