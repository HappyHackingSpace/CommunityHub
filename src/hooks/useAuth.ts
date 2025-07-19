'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'club_leader' | 'member'
  isActive: boolean
  emailVerified: boolean
  permissions: Array<{
    name: string
    granted_at: string
    granted_by: string
  }>
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  initialized: boolean
  error: string | null
}

// 🔥 MINIMAL: Simple auth hook with cookie-only approach
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    initialized: false,
    error: null
  })
  
  const router = useRouter()
  const supabase = useMemo(() => createClient(), []) // Memorize supabase client

  // 🔍 User profile fetcher
  const fetchUserProfile = useCallback(async (authUser: User): Promise<AuthUser | null> => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('id, email, name, role, is_active, permissions')
        .eq('id', authUser.id)
        .single()

      if (error) throw error

      return {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        isActive: userProfile.is_active,
        emailVerified: !!authUser.email_confirmed_at,
        permissions: Array.isArray(userProfile.permissions) ? userProfile.permissions : []
      }
    } catch (error) {
      console.error('❌ Auth: Profile fetch failed:', error)
      return null
    }
  }, [supabase])

  // 🔥 MINIMAL: Auth state handler (cookie-based)
  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    try {
      if (event === 'SIGNED_IN' && session?.user) {
        setState(prev => ({ ...prev, isLoading: true, error: null }))
        
        const userProfile = await fetchUserProfile(session.user)
        if (userProfile) {
          setState({
            user: userProfile,
            isLoading: false,
            initialized: true,
            error: null
          })
        } else {
          setState({
            user: null,
            isLoading: false,
            initialized: true,
            error: 'Profile could not be loaded'
          })
        }
        
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          isLoading: false,
          initialized: true,
          error: null
        })
        
        // 🔄 Redirect to login (cookie will be cleared automatically)
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/auth')) {
            window.location.replace('/login')
          }
        }
        
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Do nothing - let the existing state persist
        
      } else if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user)
          if (userProfile) {
            setState({
              user: userProfile,
              isLoading: false,
              initialized: true,
              error: null
            })
          } else {
            setState({
              user: null,
              isLoading: false,
              initialized: true,
              error: null
            })
          }
        } else {
          setState({
            user: null,
            isLoading: false,
            initialized: true,
            error: null
          })
        }
      }
      
    } catch (error) {
      console.error('💥 Auth: State change error:', error)
      setState(prev => ({
        ...prev,
        error: 'Authentication error occurred',
        isLoading: false,
        initialized: true
      }))
    }
  }, [fetchUserProfile])

  // 🚀 Initialize auth (cookie-based session check)
  const initializeAuth = useCallback(async () => {
    if (state.initialized) return; // Prevent re-initialization
    
    try {
      // 🍪 Get session from cookies (no localStorage involved)
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setState({
          user: null,
          isLoading: false,
          initialized: true,
          error: 'Session initialization failed'
        })
        return
      }

      await handleAuthStateChange('INITIAL_SESSION', session)
      
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        initialized: true,
        error: 'Auth initialization failed'
      })
    }
  }, [state.initialized, supabase, handleAuthStateChange])

  // 🔄 Auth event listener
  useEffect(() => {
    // Initialize auth only once
    if (!state.initialized) {
      initializeAuth()
    }
    
    // Listen to auth state changes (cookie-based)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        handleAuthStateChange(event, session)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase]) // Only depend on supabase, remove initializeAuth and handleAuthStateChange

  // 🚪 Logout function
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      // State will be updated by the auth listener
    } catch (error) {
      console.error('❌ Auth: Logout error:', error)
    }
  }, [supabase])

  // 🔄 Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!state.user) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const freshProfile = await fetchUserProfile(session.user)
        if (freshProfile) {
          setState(prev => ({ ...prev, user: freshProfile }))
        }
      }
    } catch (error) {
      console.error('❌ Auth: Profile refresh failed:', error)
    }
  }, [state.user, fetchUserProfile, supabase])

  // 🎯 Computed values
  const computedValues = useMemo(() => ({
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
    isLeader: state.user?.role === 'club_leader',
    isMember: state.user?.role === 'member',
    hasPermission: (permission: string) => {
      return state.user?.permissions?.some(p => p.name === permission) || false
    }
  }), [state.user])

  return {
    ...state,
    ...computedValues,
    logout,
    refreshProfile
  }
}
