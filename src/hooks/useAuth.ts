// src/hooks/useAuth.ts - SIMPLIFIED VERSION (No Complex Caching)
'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
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
    const prevState = { ...this.currentState }
    this.currentState = { ...this.currentState, ...updates }
    
    // Only dispatch if state actually changed
    if (JSON.stringify(prevState) !== JSON.stringify(this.currentState)) {
      this.dispatchEvent(new CustomEvent('stateChange', { 
        detail: this.currentState 
      }))
    }
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
    console.log('🔍 Auth: Fetching profile for user:', {
      id: authUser.id,
      email: authUser.email,
      hasMetadata: !!authUser.user_metadata,
      emailConfirmed: !!authUser.email_confirmed_at
    })
    
    // Simple session cache (no complex caching)
    const cached = sessionManager.getCachedUser(authUser.id);
    if (cached) {
      console.log('✅ Auth: Using cached profile for:', authUser.email)
      return cached;
    }

    if (fetchInProgressRef.current) {
      console.log('⏳ Auth: Profile fetch already in progress, skipping')
      return null
    }

    fetchInProgressRef.current = true
    
    try {
      console.log('🔍 Auth: Querying database for user profile...')
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('❌ Auth: Profile fetch error:', {
          code: error.code,
          message: error.message,
          details: error.details
        })
        
        // If user doesn't exist, try to create one
        if (error.code === 'PGRST116') {
          console.log('🔄 Auth: User profile not found, creating...')
          return await createUserProfile(authUser)
        }
        return null
      }

      if (userData) {
        console.log('✅ Auth: Profile found in database:', {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          isActive: userData.is_active
        })
        
        const userProfile: AuthUser = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          isActive: userData.is_active,
          emailVerified: userData.email_verified || false,
          permissions: userData.permissions || []
        }
        
        // Cache in simple session manager
        sessionManager.setCachedUser(authUser.id, userProfile);
        return userProfile
      }
      
      console.log('❌ Auth: No user data returned from database')
      return null
    } catch (error) {
      console.error('💥 Auth: Profile fetch exception:', error)
      return null
    } finally {
      fetchInProgressRef.current = false
    }
  }, [supabase])  // createUserProfile will be added when it's defined

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

    console.log('🔄 Auth: State change:', event, {
      userId: session?.user?.id,
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      tokenValid: !!session?.access_token,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
    })

    try {
      if (event === 'SIGNED_IN' && session?.user) {
        stateManager.setState({ isLoading: true, error: null })
        
        const userProfile = await fetchUserProfile(session.user)
        if (userProfile && mountedRef.current) {
          console.log('✅ Auth: User profile loaded successfully:', {
            userId: userProfile.id,
            role: userProfile.role,
            isActive: userProfile.isActive
          })
          stateManager.setState({
            user: userProfile,
            isLoading: false,
            initialized: true
          })
        } else {
          console.error('❌ Auth: Failed to load user profile')
          stateManager.setState({
            user: null,
            isLoading: false,
            initialized: true,
            error: 'Profil yüklenemedi'
          })
        }
        
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Auth: User signed out, clearing cache')
        sessionManager.clearCache()
        stateManager.reset()
        
        // 🔥 IMMEDIATE REDIRECT: Force immediate navigation to login
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          const publicRoutes = ['/login', '/register', '/auth/confirm']
          const isOnPublicRoute = publicRoutes.some(route => currentPath.startsWith(route))
          
          if (!isOnPublicRoute) {
            console.log('🔄 Auth: Signed out - immediate redirect from:', currentPath)
            // Use replace instead of push for cleaner history
            window.location.replace('/login')
          }
        }
        
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // 🔥 TOKEN REFRESH FIX: Don't re-fetch profile, just update session
        console.log('🔄 Auth: Token refreshed, maintaining current state')
        // Keep existing user state, just ensure session is fresh
        
      } else if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          console.log('🔍 Auth: Initial session found, loading profile...')
          stateManager.setState({ isLoading: true })
          const userProfile = await fetchUserProfile(session.user)
          if (userProfile && mountedRef.current) {
            console.log('✅ Auth: Initial profile loaded:', userProfile.email)
            stateManager.setState({
              user: userProfile,
              isLoading: false,
              initialized: true
            })
          } else {
            console.error('❌ Auth: Initial profile load failed')
            stateManager.setState({
              user: null,
              isLoading: false,
              initialized: true
            })
          }
        } else {
          console.log('🔍 Auth: No initial session found')
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
      let { data: { session }, error } = await supabase.auth.getSession()
      
      // 🔍 DEBUG: Session inspection
      console.log('🔍 Auth: Session debug:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        accessToken: session?.access_token ? 'exists' : 'missing',
        refreshToken: session?.refresh_token ? 'exists' : 'missing',
        tokenExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'no expiry',
        error: error
      })
      
      // 🔍 DEBUG: Cookie and localStorage inspection
      if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';').map(c => c.trim())
        const supabaseCookies = cookies.filter(c => c.includes('supabase'))
        console.log('🔍 Auth: Supabase cookies found:', supabaseCookies.length, supabaseCookies)
        
        // Check localStorage for Supabase session
        const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] }-auth-token`
        const storedSession = localStorage.getItem(storageKey)
        console.log('🔍 Auth: LocalStorage session:', {
          key: storageKey,
          hasStored: !!storedSession,
          storedLength: storedSession?.length || 0
        })
        
        // 🔥 FIX: If we have cookies but no session/storage, storage is corrupted
        if (supabaseCookies.length > 0 && !session?.user && !storedSession) {
          console.log('� Auth: Storage corruption detected - clearing localStorage and forcing refresh...')
          
          // Clear all localStorage
          Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('sb-')) {
              localStorage.removeItem(key)
              console.log('🧹 Auth: Cleared localStorage key:', key)
            }
          })
          
          // Force refresh session from cookies
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
            if (refreshData.session && !refreshError) {
              console.log('✅ Auth: Storage corruption fixed - session restored')
              session = refreshData.session
            } else {
              console.log('❌ Auth: Could not restore session from cookies:', refreshError)
              // Clear cookies too
              document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
              });
            }
          } catch (refreshErr) {
            console.log('💥 Auth: Session restore exception:', refreshErr)
          }
        }
      }
      
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

  // 🚀 PERFORMANCE: Global state subscription with timeout
  useEffect(() => {
    mountedRef.current = true

    // Force initialization timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      if (mountedRef.current && !stateManager.getState().initialized) {
        console.warn('⚠️ Auth: Initialization timeout - forcing initialization')
        stateManager.setState({
          user: null,
          isLoading: false,
          initialized: true,
          error: null
        })
      }
    }, 10000) // 10 second timeout

    // Subscribe to global state changes
    const handleStateChange = (event: any) => {
      if (mountedRef.current) {
        setState(event.detail)
        // Clear timeout if we get initialized
        if (event.detail.initialized) {
          clearTimeout(initTimeout)
        }
      }
    }
    
    stateManager.addEventListener('stateChange', handleStateChange)

    // Initialize auth if not already done
    if (!stateManager.getState().initialized) {
      initializeAuth()
    } else {
      setState(stateManager.getState())
      clearTimeout(initTimeout)
    }

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    return () => {
      mountedRef.current = false
      clearTimeout(initTimeout)
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
      
      // ✅ FIX: Immediate navigation after signout
      console.log('✅ Auth: Logout successful, redirecting immediately')
      window.location.replace('/login')
      
    } catch (error) {
      console.error('💥 Auth: Logout error:', error)
      // Force logout even on error
      sessionManager.clearCache()
      stateManager.reset()
      window.location.replace('/login')
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

  // 🔥 NEW: Manual session restore for cookie/session mismatch
  const restoreSession = useCallback(async () => {
    console.log('🔄 Auth: Attempting manual session restore...')
    
    try {
      // First clear corrupted localStorage
      if (typeof window !== 'undefined') {
        console.log('🧹 Auth: Clearing potentially corrupted localStorage...')
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            localStorage.removeItem(key)
            console.log('🗑️ Auth: Removed localStorage key:', key)
          }
        })
      }
      
      // Then try refreshing the session from cookies
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshData.session && !refreshError) {
        console.log('✅ Auth: Manual session restore successful')
        await handleAuthStateChange('SIGNED_IN', refreshData.session)
        return true
      } else {
        console.log('❌ Auth: Manual session restore failed:', refreshError)
        
        // If refresh fails, clear cookies and force login
        if (typeof window !== 'undefined') {
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
          console.log('🧹 Auth: Cleared all cookies due to session restore failure')
        }
        
        await supabase.auth.signOut()
        return false
      }
    } catch (error) {
      console.error('💥 Auth: Session restore exception:', error)
      return false
    }
  }, [supabase, handleAuthStateChange])

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
    refreshProfile,
    restoreSession
  }
}