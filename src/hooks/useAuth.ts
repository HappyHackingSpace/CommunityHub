// src/hooks/useAuth.ts - RACE CONDITION FREE VERSION
'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'
import { appCache } from '@/lib/cache' 

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

// 🚀 PERFORMANCE: Session state manager
class AuthSessionManager {
  private static instance: AuthSessionManager
  private sessionCache: Map<string, { user: AuthUser; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  
  static getInstance(): AuthSessionManager {
    if (!AuthSessionManager.instance) {
      AuthSessionManager.instance = new AuthSessionManager()
    }
    return AuthSessionManager.instance
  }
  
  getCachedUser(userId: string): AuthUser | null {
    const cached = this.sessionCache.get(userId)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.user
    }
    return null
  }
  
  setCachedUser(userId: string, user: AuthUser): void {
    this.sessionCache.set(userId, {
      user,
      timestamp: Date.now()
    })
  }
  
  clearCache(): void {
    this.sessionCache.clear()
  }
}

// 🚀 PERFORMANCE: Auth state management with event emitter
class AuthStateManager extends EventTarget {
  private static instance: AuthStateManager
  private currentState: AuthState = {
    user: null,
    isLoading: true,
    initialized: false,
    error: null
  }
  
  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager()
    }
    return AuthStateManager.instance
  }
  
  getState(): AuthState {
    return { ...this.currentState }
  }
  
  setState(updates: Partial<AuthState>): void {
    this.currentState = { ...this.currentState, ...updates }
    this.dispatchEvent(new CustomEvent('stateChange', { 
      detail: this.currentState 
    }))
  }
  
  reset(): void {
    this.currentState = {
      user: null,
      isLoading: false,
      initialized: true,
      error: null
    }
    this.dispatchEvent(new CustomEvent('stateChange', { 
      detail: this.currentState 
    }))
  }
}

const sessionManager = AuthSessionManager.getInstance()
const stateManager = AuthStateManager.getInstance()

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    initialized: false,
    error: null
  })
   const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const fetchInProgressRef = useRef(false)
  const mountedRef = useRef(true)


const fetchUserProfile = useCallback(async (authUser: User): Promise<AuthUser | null> => {
    const cachedResult = appCache.getAuthUser(authUser.id)
    if (cachedResult.data && !cachedResult.isStale) {
      return cachedResult.data
    }

    if (fetchInProgressRef.current) return null

    fetchInProgressRef.current = true
    
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .eq('is_active', true)
        .single()

      if (userData) {
        const userProfile: AuthUser = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          isActive: userData.is_active,
          emailVerified: userData.email_verified || false,
          permissions: userData.permissions || []
        }
        
        appCache.setAuthUser(authUser.id, userProfile)
        return userProfile
      }
      
      return null
    } finally {
      fetchInProgressRef.current = false
    }
  }, [supabase])

  // 🚀 PERFORMANCE: Profile creator with smart role detection
  const createUserProfile = useCallback(async (authUser: User): Promise<AuthUser | null> => {
    try {
      console.log('🔄 Auth: Creating new user profile for', authUser.id)
      
      let role = 'member'
      
  
      

      const newUserData = {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        role,
        is_active: true,
        email_verified: !!authUser.email_confirmed_at,
        permissions: role === 'admin' ? [
          { name: 'ADMIN_PANEL_ACCESS', granted_at: new Date().toISOString(), granted_by: 'system' },
          { name: 'MANAGE_USERS', granted_at: new Date().toISOString(), granted_by: 'system' }
        ] : role === 'club_leader' ? [
          { name: 'CREATE_CLUB', granted_at: new Date().toISOString(), granted_by: 'system' },
          { name: 'UPLOAD_FILE', granted_at: new Date().toISOString(), granted_by: 'system' }
        ] : [
          { name: 'UPLOAD_FILE', granted_at: new Date().toISOString(), granted_by: 'system' }
        ]
      }

      const { data: createdUser, error } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single()

      if (error) {
        console.error('❌ Auth: Failed to create profile:', error)
        return null
      }

      const userProfile: AuthUser = {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
        isActive: createdUser.is_active,
        emailVerified: createdUser.email_verified,
        permissions: createdUser.permissions || []
      }

      // 🚀 CACHE IMMEDIATELY
      sessionManager.setCachedUser(authUser.id, userProfile)
      console.log('✅ Auth: Profile created successfully')
      
      return userProfile
      
    } catch (error) {
      console.error('💥 Auth: Profile creation exception:', error)
      return null
    }
  }, [supabase])


  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    if (!mountedRef.current) return

    console.log('🔄 Auth: State change:', event, session?.user?.id)

    try {
      if (event === 'SIGNED_IN' && session?.user) {
        stateManager.setState({ isLoading: true, error: null })
        
        const userProfile = await fetchUserProfile(session.user)
        if (userProfile && mountedRef.current) {
          stateManager.setState({
            user: userProfile,
            isLoading: false,
            initialized: true
          })
        } else {
          stateManager.setState({
            user: null,
            isLoading: false,
            initialized: true,
            error: 'Profil yüklenemedi'
          })
        }
        
      } else if (event === 'SIGNED_OUT') {
        sessionManager.clearCache()
        stateManager.reset()
        
        // 🔥 SAFE REDIRECT: Only if not already on public route
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          const publicRoutes = ['/login', '/register', '/auth/confirm']
          const isOnPublicRoute = publicRoutes.some(route => currentPath.startsWith(route))
          
          if (!isOnPublicRoute) {
            console.log('🔄 Auth: Redirecting to login from:', currentPath)
            router.push('/login')
          }
        }
        
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // 🔥 TOKEN REFRESH FIX: Don't re-fetch profile, just update session
        console.log('🔄 Auth: Token refreshed, maintaining current state')
        // Keep existing user state, just ensure session is fresh
        
      } else if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          stateManager.setState({ isLoading: true })
          const userProfile = await fetchUserProfile(session.user)
          if (userProfile && mountedRef.current) {
            stateManager.setState({
              user: userProfile,
              isLoading: false,
              initialized: true
            })
          }
        } else {
          stateManager.setState({
            user: null,
            isLoading: false,
            initialized: true
          })
        }
      }
      
    } catch (error) {
      console.error('💥 Auth: State change error:', error)
      stateManager.setState({
        error: 'Auth state update failed',
        isLoading: false,
        initialized: true
      })
    }
  }, [fetchUserProfile, router])

  // 🚀 PERFORMANCE: Initial session setup
  const initializeAuth = useCallback(async () => {
    if (!mountedRef.current) return

    console.log('🔍 Auth: Initializing auth system...')
    stateManager.setState({ isLoading: true })

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Auth: Session error:', error)
        stateManager.setState({
          error: 'Session initialization failed',
          isLoading: false,
          initialized: true
        })
        return
      }

      await handleAuthStateChange('INITIAL_SESSION', session)
      
    } catch (error) {
      console.error('💥 Auth: Initialization error:', error)
      stateManager.setState({
        error: 'Auth initialization failed',
        isLoading: false,
        initialized: true
      })
    }
  }, [handleAuthStateChange, supabase])

  // 🚀 PERFORMANCE: Global state subscription
  useEffect(() => {
    mountedRef.current = true

    // Subscribe to global state changes
    const handleStateChange = (event: any) => {
      if (mountedRef.current) {
        setState(event.detail)
      }
    }
    
    stateManager.addEventListener('stateChange', handleStateChange)

    // Initialize auth if not already done
    if (!stateManager.getState().initialized) {
      initializeAuth()
    } else {
      setState(stateManager.getState())
    }

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    return () => {
      mountedRef.current = false
      stateManager.removeEventListener('stateChange', handleStateChange)
      subscription.unsubscribe()
    }
  }, [initializeAuth, handleAuthStateChange, supabase])

  // 🚀 PERFORMANCE: Optimized logout
  const logout = useCallback(async () => {
    console.log('👋 Auth: Logging out...')
    
    try {
      sessionManager.clearCache()
      stateManager.setState({ isLoading: true })
      
      await supabase.auth.signOut()
      
      // Force navigation after signout
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
      
    } catch (error) {
      console.error('💥 Auth: Logout error:', error)
      // Force logout even on error
      sessionManager.clearCache()
      stateManager.reset()
      window.location.href = '/login'
    }
  }, [supabase])

  // 🚀 PERFORMANCE: Refresh profile function
  const refreshProfile = useCallback(async () => {
    const currentUser = state.user
    if (!currentUser) return

    sessionManager.clearCache()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const freshProfile = await fetchUserProfile(session.user)
      if (freshProfile) {
        stateManager.setState({ user: freshProfile })
      }
    }
  }, [state.user, fetchUserProfile, supabase])

  // 🚀 PERFORMANCE: Memoized computed values
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